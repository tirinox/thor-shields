import {ModeBase} from "@/visual/modes/ModeBase";
import * as THREE from "three";
import {Config} from "@/config";
import {AttractorShape} from "@/helpers/physics/AttractorShape";
import {THORChainLogoShape} from "@/helpers/physics/TCLogoShape";
import {Random} from "@/helpers/MathUtil";

export class ModeNormal extends ModeBase {
    constructor(scene) {
        super(scene);

        this._circleRadius = 350.0
        const force = Config.Physics.BaseForce
        this.tcAttractor = new AttractorShape(THORChainLogoShape.triangles(0, 100, 1.8), force)
    }

    handleObject(physObj) {
        physObj.attractors = this.tcAttractor
    }

    onEnter(nodeObjList) {
        const label = this.makeLabel('THORChain', new THREE.Vector3(0, -580, -10), 18)
        label.t.opacity = 0.8;

        super.onEnter();

        nodeObjList.forEach(o => {
            o.velocity.add(new THREE.Vector3(0, Random.getRandomFloat(100, 1000), 0))
        })
    }
}