import {ModeBase} from "@/visual/modes/ModeBase";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import _ from "lodash";
import {CirclePack} from "@/helpers/physics/CirclePack";
import {Config} from "@/config";

export class ModeVersion extends ModeBase {
    constructor(scene) {
        super(scene);

        this._circleRadius = 350.0
        this._sideDistance = 600

        this.force = Config.Physics.BaseForce
        this.attractors = {}
        this.circlePacker = new CirclePack(this.force, 1200, 300, 0.02, 1)
        this._attractorBanish = new Attractor(new THREE.Vector3(0, 0, 0), -100.0)
    }

    // update() {
    //     // this.circlePacker.pack(dt)
    //     this._transferAttractorsPositionFromPacker()
    // }

    handleObject(physObj) {
        super.handleObject(physObj);

        if (physObj) {
            let groupName = physObj.node.version
            physObj.attractors = [(this.attractors[groupName] ?? this._attractorBanish)]
        }
    }

    onEnter(objList) {
        this._createVersionAttractors(objList)
        super.onEnter();
    }

    _createVersionAttractors(objList) {
        const versions = {}
        let mostPopularVersion = '', mostPopularCount = 0
        for (const nodeObj of objList) {
            const version = nodeObj.node.version
            if (version === '') {
                continue
            }

            const current = (versions[version] ?? 0) + 1

            if (current > mostPopularCount) {
                mostPopularCount = current
                mostPopularVersion = version
            }
            versions[version] = current
        }

        this.circlePacker.clear()
        this.attractors = {}
        for (const [version, count] of _.entries(versions)) {
            const circleRadius = Math.sqrt(+count) * 130.0

            if(version !== mostPopularVersion) {
                this.circlePacker.addCircle(version, circleRadius)
            }
            this.attractors[version] = new Attractor(new THREE.Vector3(),
                this.force, 0, 0, 0, Math.sqrt(+count) * 20)
        }
        this.circlePacker.arrangeAroundCenter()

        const popularRadius = Math.sqrt(+mostPopularCount) * 100.0
        this.circlePacker.addCircle(mostPopularVersion, popularRadius)

        this._transferAttractorsPositionFromPacker()
        this._makeLabels()
    }

    _makeLabels() {
        const packedPositions = this.circlePacker.getResults()
        for (const [version, {position}] of _.entries(packedPositions)) {
            const text = `v. ${version}`
            this.makeLabel(text, new THREE.Vector3(position.x, position.y - 150.0, 200.0), 5)
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
}
