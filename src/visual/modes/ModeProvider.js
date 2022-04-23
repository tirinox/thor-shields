import {ModeBase} from "@/visual/modes/ModeBase";
import {CirclePack} from "@/helpers/physics/CirclePack";
import _ from "lodash";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import {Config} from "@/config";
import {providerShortName} from "@/helpers/THORUtil";

const UNKNOWN = 'UNKNOWN'

export class ModeProvider extends ModeBase {
    constructor(scene) {
        super(scene);
        this._attractorBanish = new Attractor(new THREE.Vector3(0, 0, 0), -100.0)
        this.attractors = {}
        this.force = Config.Physics.BaseForce
        this.circlePacker = new CirclePack(this.force, 1200, 300, 0.02, 1)
    }

    createProviderAttractors(objList) {
        const providers = {}
        for (const nodeObj of objList) {
            const ipInfo = nodeObj.ipInfo
            const provider = providerShortName(ipInfo ? ipInfo.asname : UNKNOWN)
            const current = providers[provider] ?? 0
            providers[provider] = current + 1
        }

        this.circlePacker.clear()
        this.attractors = {}
        for (const [name, count] of _.entries(providers)) {
            const circleRadius = Math.sqrt(+count) * 100.0
            console.log(name, circleRadius)

            this.circlePacker.addCircle(name, circleRadius)
            this.attractors[name] = new Attractor(new THREE.Vector3(),
                this.force, 0, 0, 0, Math.sqrt(+count) * 20)
        }
        this.circlePacker.arrangeAroundCenter()
        this._transferAttractorsPositionFromPacker()
        this._makeLabels()
    }

    _makeLabels() {
        const packedPositions = this.circlePacker.getResults()
        for (const [name, {position}] of _.entries(packedPositions)) {
            this.makeLabel(name, new THREE.Vector3(position.x, position.y - 150.0, 200.0), 5)
        }
    }

    _transferAttractorsPositionFromPacker() {
        const packedPositions = this.circlePacker.getResults()
        for (const [name, {position}] of _.entries(packedPositions)) {
            const attr = this.attractors[name]
            if (attr) {
                attr.position.copy(position)
            } else {
                console.warn(`no attr for ${name}`)
            }
        }
    }

    update() {
        // this.circlePacker.pack(dt)
        this._transferAttractorsPositionFromPacker()
    }

    handleObject(physObj) {
        super.handleObject(physObj);

        if (!physObj) {
            return;
        }

        let groupName = providerShortName(
            (physObj.ipInfo && physObj.ipInfo.asname) ? physObj.ipInfo.asname : UNKNOWN
        )
        physObj.attractors = [(this.attractors[groupName] ?? this._attractorBanish)]
    }
}