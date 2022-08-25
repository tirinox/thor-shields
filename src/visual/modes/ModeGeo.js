import {ModeBase} from "@/visual/modes/ModeBase";
import * as THREE from "three";
import {Config} from "@/config";
import {Attractor} from "@/helpers/physics/Attractor";
import {longLatTo3D} from "@/helpers/3D";
import TWEEN from "tween";
import _ from "lodash";

export class ModeGeo extends ModeBase {
    constructor(scene) {
        super(scene);

        this.force = Config.Physics.BaseForce
        this._banishAttractor = new Attractor(new THREE.Vector3(0, 0, 0), this.force)

        this._nameToAttractor = {}
        this._coordToAttractor = {}
    }

    handleObject(physObj) {
        const attr = this._nameToAttractor[physObj.name]
        physObj.attractors = attr ? [attr] : [this._banishAttractor]
    }

    onEnter(nodeObjects) {
        +nodeObjects

        this.makeLabel('Geo', new THREE.Vector3(0, -630, -10), 14, 0, true)

        super.onEnter();

        // this._createAttractors(nodeObjects)
        this._createAttractorsStacked(nodeObjects)
        this._makeGlobe()
    }

    onLeave(nodeObjects) {
        this._destroyGlobe()
        _.forEach(nodeObjects, nodeObj => nodeObj.shootOut(2000))
        super.onLeave();
    }

    _makeGlobe() {
        if (this.globeMesh) {
            return
        }
        const textureLoader = new THREE.TextureLoader()

        const globeConfig = Config.Scene.Globe
        const geometry = new THREE.SphereGeometry(globeConfig.Radius, globeConfig.Details, globeConfig.Details);
        const material = new THREE.MeshPhongMaterial({
            depthWrite: true,
            // depthTest: true
            // transparent: true,
            // opacity: 0.5,
        });
        material.map = textureLoader.load(Config.Scene.Globe.TextureMap);
        this.globeMesh = new THREE.Mesh(geometry, material);
        this.globeMesh.renderOrder = 9999
        this.scene.add(this.globeMesh)

        this.globeMesh.scale.set(0.01, 0.01, 0.01)
        new TWEEN.Tween(this.globeMesh.scale)
            .to(new THREE.Vector3(1, 1, 1))
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start()

        const geometryAtmo = new THREE.SphereGeometry(
            globeConfig.Radius + 2.0,
            globeConfig.Details, globeConfig.Details)
        const materialAtmo = new THREE.MeshPhongMaterial({
            map: textureLoader.load(globeConfig.TextureAtmo),
            side: THREE.DoubleSide,
            opacity: 0.1,
            transparent: true,
            depthWrite: false,
        });
        this.cloudMesh = new THREE.Mesh(geometryAtmo, materialAtmo)
        this.globeMesh.add(this.cloudMesh)
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
        this.cloudMesh.rotation.y += 0.02 * dt;
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
        for(const {stack, longitude, latitude} of _.values(this._coordToStack)) {
            const sortedStack = _.sortBy(stack, nodeObject => -nodeObject.node.bond)
            let radius = basicRadius
            for(const nodeObj of sortedStack) {
                const position3d = longLatTo3D(longitude, latitude, radius)
                this._nameToAttractor[nodeObj.node.address] = new Attractor(position3d,
                    this.force, 0.0, 0.0, Attractor.INFINITE, 5.0)
                radius += nodeObj.radius * 1.2
            }
        }

        console.log(`Total attractors were made: ${this._coordToAttractor.length}.`)
    }
}
