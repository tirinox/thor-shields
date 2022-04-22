import {ModeBase} from "@/visual/modes/ModeBase";
import {CirclePackMy} from "@/helpers/physics/CirclePack";
import _ from "lodash";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";

const UNKNOWN = 'unknown'

export class ModeProvider extends ModeBase {
    constructor() {
        super();
        this._attractorBanish = new Attractor(new THREE.Vector3(0, 0, 0), -100.0)
    }

    updateProviderAttractors(objList) {
        const providers = {}
        for (const nodeObj of objList) {
            const ipInfo = nodeObj.ipInfo
            const provider = ipInfo ? ipInfo.asname : UNKNOWN
            const current = providers[provider] ?? 0
            providers[provider] = current + 1
        }

        const packer = new CirclePackMy(1000, 2000, 5000)
        for (const [name, count] of _.entries(providers)) {
            packer.addCircle(name, Math.sqrt(+count) * 30.0)
        }
        const packedPositions = packer.pack()
        this.attractors = {}
        for (const [name, {position, radius}] of _.entries(packedPositions)) {
            this.attractors[name] = new Attractor(position,
                this.force, 0, 0, 0, radius * 0.7)
        }
    }

    handleObject(physObj) {
        super.handleObject(physObj);

        if (!physObj) {
            return;
        }

        let groupName = UNKNOWN
        if (physObj.ipInfo && physObj.ipInfo.asname) {
            groupName = physObj.ipInfo.asname
        }

        const attractor = this.attractors[groupName]
        if (attractor) {
            physObj.attractors = [attractor]
        } else {
            physObj.attractors = [this._attractorBanish]
        }
    }
}