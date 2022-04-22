import {ModeBase} from "@/visual/modes/ModeBase";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import {Config} from "@/config";
import {NodeStatus} from "@/helpers/NodeTracker";

export class ModeNormal extends ModeBase {
    constructor() {
        super();

        this._circleRadius = 350.0
        const force = Config.Physics.BaseForce
        this.globalAttractor = new Attractor(new THREE.Vector3(),
            force, 0, 0, 0, this._circleRadius)
        this.standByOuter = new Attractor(new THREE.Vector3(),
            -0.25 * force)
    }

    handleObject(physObj) {
        super.handleObject(physObj);

        const distance = physObj.realObject.position.length()
        // const toCenter = obj.o.position.clone().normalize()
        if (distance > this._circleRadius) {
            // outside the circle everybody want to go back in
            physObj.attractors = [this.globalAttractor]
        } else {
            if (physObj.node.status !== NodeStatus.Active) {
                physObj.attractors = [this.standByOuter]
            } else {
                physObj.attractors = []
            }
        }
    }
}