import {ModeBase} from "@/visual/modes/ModeBase";
import {NodeStatus} from "@/helpers/NodeTracker";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import {Config} from "@/config";
import _ from "lodash";
import {AttractorShape} from "@/helpers/physics/AttractorShape";
import {THORChainLogoShape} from "@/helpers/physics/TCLogoShape";

const ANY_STATUS = '*'

export class ModeStatus extends ModeBase {
    constructor(scene) {
        super(scene);

        this._circleRadius = 350.0
        this._sideDistance = 600

        const force = Config.Physics.BaseForce

        this.tcAttractor = new AttractorShape(THORChainLogoShape.triangles(0, 100, 1.6), force)

        this.attractors = {
            [NodeStatus.Active]: [
                // new Attractor(new THREE.Vector3(0.0, 0, 0), force, 0, 0, 0, this._circleRadius),
                this.tcAttractor,
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

    onEnter(nodeObj) {
        const statusesCounted = _.countBy(nodeObj, 'node.status')
        const standbyCount = statusesCounted[NodeStatus.Standby]
        const activeCount = statusesCounted[NodeStatus.Active]
        const otherCount = nodeObj.length - (standbyCount + activeCount)

        this.makeLabel('Active', new THREE.Vector3(0, -500, 0), 20)
        this.makeLabel('Standby', new THREE.Vector3(-this._sideDistance, -420, 0), 12)
        this.makeLabel('Other', new THREE.Vector3(this._sideDistance, -420, 0), 12)

        this.makeLabel(activeCount, new THREE.Vector3(0, -650, 0), 10, -45)
        this.makeLabel(standbyCount, new THREE.Vector3(-this._sideDistance, -500, 0), 6, -45)
        this.makeLabel(otherCount, new THREE.Vector3(this._sideDistance, -500, 0), 6, -45)

        super.onEnter();
    }
}
