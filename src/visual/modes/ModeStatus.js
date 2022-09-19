import {ModeBase} from "@/visual/modes/ModeBase";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import {Config} from "@/config";
import _ from "lodash";
import {AttractorShape} from "@/helpers/physics/AttractorShape";
import {THORChainLogoShape} from "@/helpers/physics/TCLogoShape";
import {NodeStatus} from "@/helpers/data/NodeInfo";

const ANY_STATUS = '*'

export class ModeStatus extends ModeBase {
    constructor(scene) {
        super(scene);

        this._circleRadius = 350.0
        this._sideDistance = 600

        const force = Config.Physics.BaseForce

        this.tcAttractor = new AttractorShape(THORChainLogoShape.triangles(0, 100, 1.6), force)
        this._standbyAttractors = [
            new Attractor(new THREE.Vector3(-this._sideDistance, 0, 0), force, 0, 0, 0, this._circleRadius * 0.3),
            new Attractor(new THREE.Vector3(-this._sideDistance, 0, 0), force * 0.02),
        ]

        this.attractors = {
            [NodeStatus.Active]: [
                this.tcAttractor,
            ],
            [NodeStatus.Standby]: this._standbyAttractors,
            [NodeStatus.Ready]: this._standbyAttractors,
            [ANY_STATUS]: [
                new Attractor(new THREE.Vector3(this._sideDistance, 0, 0), force, 0, 0, 0, this._circleRadius * 0.3),
                new Attractor(new THREE.Vector3(this._sideDistance, 0, 0), force * 0.02),
            ],
        }
    }

    handleObject(physObj) {
        physObj.attractors = null

        const bestAttractors = this.attractors[physObj.node.status]
        if (bestAttractors) {
            physObj.attractors = bestAttractors
        } else {
            physObj.attractors = this.attractors[ANY_STATUS]
        }
    }

    onEnter(nodeObj) {
        const statusesCounted = _.countBy(nodeObj, 'node.status')
        const standbyCount = (statusesCounted[NodeStatus.Standby] || 0) + (statusesCounted[NodeStatus.Ready] || 0)
        const activeCount = (statusesCounted[NodeStatus.Active] || 0)
        const otherCount = nodeObj.length - (standbyCount + activeCount)

        this.makeLabel({text: 'Active', position: new THREE.Vector3(0, -500, 0), scale: 20})
        this.makeLabel({text: 'Standby', position: new THREE.Vector3(-this._sideDistance, -420, 0), scale: 12}).opacity = 0.8
        this.makeLabel({text: 'Other', position: new THREE.Vector3(this._sideDistance, -420, 0), scale: 12}).opacity = 0.8

        this.makeLabel({
            text: activeCount, position: new THREE.Vector3(0, -650, 0), scale: 10,
        })
        this.makeLabel({
            text: standbyCount, position: new THREE.Vector3(-this._sideDistance, -500, 0), scale: 6,
        })
        this.makeLabel({
            text: otherCount, position: new THREE.Vector3(this._sideDistance, -500, 0), scale: 6,
        })

        super.onEnter();
    }
}
