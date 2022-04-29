import {ModeBase} from "@/visual/modes/ModeBase";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import _ from "lodash";
import {CirclePack} from "@/helpers/physics/CirclePack";
import {Config} from "@/config";
import {NodeObject} from "@/visual/NodeObject";

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
        let mostPopularVersion = '', mostPopularList = []
        for (const nodeObj of objList) {
            const version = nodeObj.node.version
            if (version === '') {
                continue
            }

            if(!versions[version]) {
                versions[version] = []
            }

            const currentList = versions[version]
            currentList.push(nodeObj)

            if (currentList.length > mostPopularList.length) {
                mostPopularList = currentList
                mostPopularVersion = version
            }
        }

        this.circlePacker.clear()
        this.attractors = {}
        for (const [version, items] of _.sortBy(_.entries(versions), [(o) => o[0]])) {
            const circleRadius = NodeObject.estimateRadiusOfGroup(items)

            this.attractors[version] = new Attractor(new THREE.Vector3(),
                this.force, 0, 0, 0, circleRadius)

            if(version !== mostPopularVersion) {
                this.circlePacker.addCircle(version, circleRadius)
            }
        }
        this.circlePacker.arrangeAroundCenter()

        const popularRadius = NodeObject.estimateRadiusOfGroup(mostPopularList)
        this.circlePacker.addCircle(mostPopularVersion, popularRadius)

        this._transferAttractorsPositionFromPacker()
        this._makeLabels()
    }

    _makeLabels() {
        const packedPositions = this.circlePacker.getResults()
        for (const [version, {position}] of _.entries(packedPositions)) {
            const text = `v. ${version}`
            const attr = this.attractors[version]
            if(attr) {
                this.makeLabel(text,
                    new THREE.Vector3(position.x, position.y + attr.relaxRadius * 1.1, 200.0),
                    2.5)
            }
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
