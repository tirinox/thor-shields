import {ModeBase} from "@/visual/modes/ModeBase";
import * as THREE from "three";
import {Config} from "@/config";
import {AttractorShape} from "@/helpers/physics/AttractorShape";
import {THORChainLogoShape} from "@/helpers/physics/TCLogoShape";

export class ModeNormal extends ModeBase {
    constructor(scene) {
        super(scene);

        this._circleRadius = 350.0
        const force = Config.Physics.BaseForce
        this.tcAttractor = new AttractorShape(THORChainLogoShape.triangles(0, 100, 1.8), force)
    }

    handleObject(physObj) {
        super.handleObject(physObj);
        physObj.attractors = [this.tcAttractor]
    }

    onEnter() {
        this.makeLabel('THORChain', new THREE.Vector3(0, -580, -100), 18)
        super.onEnter();
    }
}