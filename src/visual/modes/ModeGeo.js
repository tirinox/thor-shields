import {ModeBase} from "@/visual/modes/ModeBase";
import * as THREE from "three";
import {Config} from "@/config";
import {Attractor} from "@/helpers/physics/Attractor";
import {longLatTo3D} from "@/helpers/3D";
import TWEEN from "tween";

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

        this.makeLabel('Geo', new THREE.Vector3(0, -630, -10), 14)

        super.onEnter();

        this._createAttractors(nodeObjects)
        this._makeGlobe()
    }

    onLeave() {
        this._destroyGlobe()
        super.onLeave();
    }

    _makeGlobe() {
        if(this.globeMesh) {
            return
        }

        const geometry = new THREE.SphereGeometry(Config.Scene.Globe.Radius, 32, 32);
        const material = new THREE.MeshPhongMaterial();
        this.globeMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.globeMesh)

        this.globeMesh.scale.set(0.01, 0.01, 0.01)
        new TWEEN.Tween(this.globeMesh.scale)
            .to(new THREE.Vector3(1,1,1))
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start()
    }

    _destroyGlobe() {
        if(!this.globeMesh) {
            return
        }
        const g = this.globeMesh

        new TWEEN.Tween(g.scale)
            .to(new THREE.Vector3(0.01, 0.01, 0.01))
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onComplete(() => {g.parent.remove(g)})
            .start()

        this.globeMesh = null
    }

    _createAttractors(nodeObjects) {
        const r = Config.Scene.Globe.Radius
        this._nameToAttractor = {}
        this._coordToAttractor = {}

        for (const nodeObject of nodeObjects) {
            const info = nodeObject.node.IPInfo
            if (!info || !nodeObject.node.IPAddress) {
                this._nameToAttractor[nodeObject.node.address] = this._banishAttractor
            } else {
                const key = `${info.longitude}, ${info.latitude}`
                let attractorHere = this._coordToAttractor[key]
                if(!attractorHere) {
                    const {x, y, z} = longLatTo3D(info.longitude, info.latitude, r)
                    attractorHere = this._coordToAttractor[key] =  new Attractor(new THREE.Vector3(x, y, z),
                        this.force, 0.0, 0.0, Attractor.INFINITE, 10.0)
                }
                this._nameToAttractor[nodeObject.node.address] = attractorHere
            }
        }
        console.log(`Total attractors were made: ${this._coordToAttractor.length}.`)
    }
}
