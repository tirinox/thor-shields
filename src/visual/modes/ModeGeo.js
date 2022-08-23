import {ModeBase} from "@/visual/modes/ModeBase";
import * as THREE from "three";
import {Config} from "@/config";
import {Attractor} from "@/helpers/physics/Attractor";
import {longLatTo3D} from "@/helpers/3D";

export class ModeGeo extends ModeBase {
    constructor(scene) {
        super(scene);
        this.nameToAttractor = {}
        this.force = Config.Physics.BaseForce
        this._noBondAttractor = new Attractor(new THREE.Vector3(0, 0, -2500), this.force)

    }

    handleObject(physObj) {
        const attr = this.nameToAttractor[physObj.name]
        physObj.attractors = attr ? [attr] : [this._noBondAttractor]
    }

    onEnter(nodeObjects) {
        +nodeObjects

        this.makeLabel('Geo', new THREE.Vector3(0, -630, -10), 14)

        super.onEnter();

        this._createAttractors(nodeObjects)
    }

    _createAttractors(nodeObjects) {
        const r = Config.Scene.Globe.Radius
        this.nameToAttractor = {}
        for (const nodeObject of nodeObjects) {
            const info = nodeObject.node.IPInfo
            if (!info) {
                this.nameToAttractor[nodeObject.node.address] = this._noBondAttractor
            } else {
                const {x, y, z} = longLatTo3D(info.longitude, info.latitude, r)
                this.nameToAttractor[nodeObject.node.address] = new Attractor(new THREE.Vector3(x, y, z),
                    this.force, 0, 0, -1, 10.0)
            }
        }
    }
}
