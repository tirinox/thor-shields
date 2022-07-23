import {ModeBase} from "@/visual/modes/ModeBase";
import * as THREE from "three";

export class ModeBond extends ModeBase {
    constructor(scene) {
        super(scene);
    }

    handleObject(physObj) {
        super.handleObject(physObj);
        physObj.attractors = []
    }

    onEnter() {
        const label = this.makeLabel('Bonds', new THREE.Vector3(0, -580, -10), 14)
        label.t.opacity = 0.8;

        super.onEnter();
    }
}
