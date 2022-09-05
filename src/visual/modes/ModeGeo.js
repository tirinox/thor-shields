import {ModeBase} from "@/visual/modes/ModeBase";
import * as THREE from "three";
import {Config} from "@/config";
import {Attractor} from "@/helpers/physics/Attractor";
import {longLatTo3D} from "@/helpers/3D";
import TWEEN from "tween";
import _ from "lodash";

import AtmosphereFragmentShader from '@/visual/shader/globe_atmo_textured.frag'
import StdVertexShader from '@/visual/shader/standard.vert'

export class ModeGeo extends ModeBase {
    constructor(scene) {
        super(scene);
        this.isFlat = false

        this.force = Config.Physics.BaseForce * 1.2
        this._banishAttractor = new Attractor(new THREE.Vector3(0, 0, 0), this.force)

        this._nameToAttractor = {}
        this._coordToAttractor = {}
    }

    handleObject(physObj) {
        const attr = this._nameToAttractor[physObj.name]
        physObj.attractors = attr ? [attr] : [this._banishAttractor]
    }

    onEnter(nodeObjects, group) {
        // this.makeLabel('Geo', new THREE.Vector3(0, -630, -10), 14, 0, true)
        super.onEnter();

        group.repelEnabled = false

        this._createAttractorsStacked(nodeObjects)

        if (Config.Scene.Globe.Enabled) {
            this._makeGlobe()
            this._putInGlobe()
        }
    }

    onLeave(nodeObjects, group) {
        this._destroyGlobe()
        _.forEach(nodeObjects, nodeObj => nodeObj.shootOut(2000))
        super.onLeave();
        group.repelEnabled = true
    }

    _makeGlobe() {
        if (this.globeMesh) {
            return
        }
        const textureLoader = new THREE.TextureLoader()

        const globeConfig = Config.Scene.Globe
        const geometry = new THREE.SphereGeometry(globeConfig.Radius, globeConfig.Details, globeConfig.Details);
        // const basicMaterial = new THREE.MeshPhongMaterial({
        //     color: 0x555555,
        //     // depthWrite: true,
        //     // depthTest: true,
        // });

        const material = new THREE.ShaderMaterial({
            name: 'AtmosphereShaderMaterial',
            fragmentShader: AtmosphereFragmentShader,
            vertexShader: StdVertexShader,
            uniforms: {
                globeTexture: {
                    value: textureLoader.load(Config.Scene.Globe.TextureMap)
                }
            },
            // side: THREE.FrontSide,
            // depthWrite: true,
            // depthTest: true,
        })

        this.globeMesh = new THREE.Mesh(geometry, material);
        this.globeMesh.renderOrder = 9999
        this.scene.add(this.globeMesh)

        // const dummyMesh = new THREE.Mesh(geometry, material)
        // dummyMesh.scale.setScalar(0.9)
        // this.globeMesh.add(dummyMesh)

        // if(globeConfig.InnerAtmosphere.Enabled) {
        //     const innerAtmoMaterial = new THREE.ShaderMaterial({
        //         name: 'AtmosphereShaderMaterial',
        //         fragmentShader: AtmosphereFragmentShader,
        //         vertexShader: StdVertexShader,
        //         uniforms: {
        //             globeTexture: {
        //                 value: textureLoader.load(Config.Scene.Globe.TextureMap)
        //             }
        //         },
        //         // side: THREE.FrontSide,
        //         // depthWrite: true,
        //         // depthTest: true,
        //     })
        //
        //     this.innerAtmoMesh = new THREE.Mesh(geometry, innerAtmoMaterial)
        //     // this.innerAtmoMesh.scale.setScalar(1.1)
        //     this.globeMesh.add(this.innerAtmoMesh)
        // }

        if (globeConfig.Clouds.Opacity > 0) {
            const materialClouds = new THREE.MeshPhongMaterial({
                map: textureLoader.load(globeConfig.Clouds.Texture),
                side: THREE.DoubleSide,
                opacity: globeConfig.Clouds.Opacity,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });
            this.cloudMesh = new THREE.Mesh(geometry, materialClouds)
            this.cloudMesh.scale.setScalar(globeConfig.Clouds.ElevationScale)
            this.globeMesh.add(this.cloudMesh)

            this.cloudMesh2 = new THREE.Mesh(geometry, materialClouds)
            this.cloudMesh2.scale.setScalar(globeConfig.Clouds.ElevationScale)
            this.globeMesh.add(this.cloudMesh2)
        }

        // if(globeConfig.Atmosphere) {
        //     const materialAtmosphere = new THREE.ShaderMaterial({
        //         name: 'AtmosphereShaderMaterial',
        //         fragmentShader: AtmosphereFragmentShader,
        //         vertexShader: StdVertexShader,
        //         uniforms: {},
        //         side: THREE.FrontSide,
        //         depthWrite: false
        //     })
        //     this.atmosphereMesh = new THREE.Mesh(geometry, materialAtmosphere)
        //     this.atmosphereMesh.scale.setScalar(globeConfig.Atmosphere.ElevationScale)
        //     this.globeMesh.add(this.atmosphereMesh)
        // }
    }

    _putInGlobe() {
        this.globeMesh.scale.set(0.01, 0.01, 0.01)
        new TWEEN.Tween(this.globeMesh.scale)
            .to(new THREE.Vector3(1, 1, 1))
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start()
    }

    _destroyGlobe() {
        if (!this.globeMesh) {
            return
        }
        const g = this.globeMesh

        new TWEEN.Tween(g.scale)
            .to(new THREE.Vector3(0.01, 0.01, 0.01))
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onComplete(() => {
                g.parent.remove(g)
            })
            .start()

        this.globeMesh = null
    }

    update(dt) {
        super.update(dt);
        if (this.cloudMesh) {
            this.cloudMesh.rotation.y += 0.02 * dt
        }
        if (this.cloudMesh2) {
            this.cloudMesh2.rotation.y -= 0.04 * dt
        }
    }

    _createAttractors(nodeObjects) {
        const r = Config.Scene.Globe.Radius + Config.Scene.Globe.NodeElevation
        this._nameToAttractor = {}
        this._coordToAttractor = {}

        for (const nodeObject of nodeObjects) {
            const info = nodeObject.node.IPInfo
            if (!info || !nodeObject.node.IPAddress) {
                this._nameToAttractor[nodeObject.node.address] = this._banishAttractor
            } else {
                const key = `${info.longitude}, ${info.latitude}`
                let attractorHere = this._coordToAttractor[key]
                if (!attractorHere) {
                    const position3d = longLatTo3D(info.longitude, info.latitude, r)
                    attractorHere = this._coordToAttractor[key] = new Attractor(position3d,
                        this.force, 0.0, 0.0, Attractor.INFINITE, 5.0)
                }
                this._nameToAttractor[nodeObject.node.address] = attractorHere

            }
        }
        console.log(`Total attractors were made: ${this._coordToAttractor.length}.`)
    }

    _createAttractorsStacked(nodeObjects) {
        this._nameToAttractor = {}
        this._coordToStack = {}

        for (const nodeObject of nodeObjects) {
            const info = nodeObject.node.IPInfo
            if (!info || !nodeObject.node.IPAddress) {
                this._nameToAttractor[nodeObject.node.address] = this._banishAttractor
            } else {
                const key = `${info.longitude}, ${info.latitude}`
                let stackObj = this._coordToStack[key]
                if (!stackObj) {
                    this._coordToStack[key] = stackObj = {
                        stack: [],
                        longitude: info.longitude,
                        latitude: info.latitude,
                    }
                }
                stackObj.stack.push(nodeObject)
                // this._nameToAttractor[nodeObject.node.address] = attractorHere
            }
        }

        const basicRadius = Config.Scene.Globe.Radius + Config.Scene.Globe.NodeElevation
        for (const {stack, longitude, latitude} of _.values(this._coordToStack)) {
            const sortedStack = _.sortBy(stack, nodeObject => -nodeObject.node.bond)
            let radius = basicRadius
            for (const nodeObj of sortedStack) {
                const position3d = longLatTo3D(longitude, latitude, radius)
                this._nameToAttractor[nodeObj.node.address] = new Attractor(position3d,
                    this.force, 0.0, 0.0, Attractor.INFINITE, 5.0)
                radius += nodeObj.radius * 2.1
            }
        }

        console.log(`Total attractors were made: ${this._coordToAttractor.length}.`)
    }
}
