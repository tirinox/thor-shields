import {ModeBase} from "@/visual/modes/ModeBase";
import {NodeStatus} from "@/helpers/NodeTracker";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import {Config} from "@/config";

const ANY_STATUS = '*'

export class ModeStatus extends ModeBase {
    constructor(scene) {
        super(scene);

        this._circleRadius = 350.0
        this._sideDistance = 600

        const force = Config.Physics.BaseForce
        this.attractors = {
            [NodeStatus.Active]: [
                new Attractor(new THREE.Vector3(0.0, 0, 0), force, 0, 0, 0, this._circleRadius),
            ],
            [NodeStatus.Standby]: [
                new Attractor(new THREE.Vector3(-this._sideDistance, 0, 0), force, 0, 0, 0, this._circleRadius * 0.3),
                new Attractor(new THREE.Vector3(-this._sideDistance, 0, 0), force * 0.02),
            ],
            [ANY_STATUS]: [
                new Attractor(new THREE.Vector3(this._sideDistance, 0, 0), force, 0, 0, 0, this._circleRadius * 0.3),
                new Attractor(new THREE.Vector3(this._sideDistance, 0, 0), force * 0.02),
            ],
        }
    }

    handleObject(physObj) {
        super.handleObject(physObj);

        physObj.attractors = []

        const bestAttractors = this.attractors[physObj.node.status]
        if (bestAttractors) {
            physObj.attractors = bestAttractors
        } else {
            physObj.attractors = this.attractors[ANY_STATUS]
        }
    }

    onEnter() {
        this.makeLabel('Active', new THREE.Vector3(0, -500, 0), 20)
        this.makeLabel('Standby', new THREE.Vector3(-this._sideDistance, -400, 0), 12)
        this.makeLabel('Other', new THREE.Vector3(this._sideDistance, -400, 0), 12)
        super.onEnter();
    }
}
