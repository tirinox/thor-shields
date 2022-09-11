import {ModeBase} from "@/visual/modes/ModeBase";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import _ from "lodash";
import {CirclePack} from "@/helpers/physics/CirclePack";
import {Config} from "@/config";
import {NodeObject} from "@/visual/NodeObject";
import {NodeEvent} from "@/helpers/NodeEvent";

export class ModeVersion extends ModeBase {
    constructor(scene) {
        super(scene);

        this._circleRadius = 350.0
        this._sideDistance = 600

        this.force = Config.Physics.BaseForce
        this.attractors = {}
        this.circlePacker = new CirclePack(this.force, 1200, 300, Config.Physics.BaseFriction, 1)
        this._attractorBanish = new Attractor(new THREE.Vector3(0, 0, 0), -100.0)

        this._currentVersionSet = []
    }

    _collectVersions(nodeObjects) {
        return _.uniq(_.map(nodeObjects, 'node.version'))
    }

    reactEvent(event, nodeObjects) {
        // fixme: if there are multiple new versions, then it re-creates attractors multiple times per tick!!
        if (event.type === NodeEvent.EVENT_TYPE.VERSION) {
            if (!this.attractors[event.currValue]) {
                console.log(`New version detected: ${event.currValue}`)
                // this.clearLabels()
                this._packAttractorPositions(nodeObjects)
                this._juggleLabels(nodeObjects)
            }
        }
    }

    _juggleLabels(nodeObjects) {
        const freshVersionSet = this._collectVersions(nodeObjects)
        const addedVersions = _.difference(freshVersionSet, this._currentVersionSet)
        const removedVersions = _.difference(this._currentVersionSet, freshVersionSet)
        if (addedVersions.length || removedVersions.length) {
            console.log(`removedVersions = ${removedVersions}, addedVersions = ${addedVersions}`)
            _.each(removedVersions, v => {
                this.killLabelByKey(v)
            })
        }

        this._currentVersionSet = freshVersionSet
    }

    handleObject(physObj) {
        if (physObj) {
            let groupName = physObj.node.version
            physObj.attractors = (this.attractors[groupName] ?? this._attractorBanish)
        }
    }

    onEnter(objList) {
        this._createVersionAttractors(objList)
        this.makeLabel({
            text: 'Versions',
            position: new THREE.Vector3(0, -630, -10), scale: 14
        })
    }

    _packAttractorPositions(objList) {
        const versions = {}
        let mostPopularVersion = '', mostPopularList = []
        for (const nodeObj of objList) {
            const version = nodeObj.node.version
            if (version === '') {
                continue
            }

            if (!versions[version]) {
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

            if (version !== mostPopularVersion) {
                this.circlePacker.addCircle(version, circleRadius)
            }
        }
        this.circlePacker.arrangeAroundCenter()

        const popularRadius = NodeObject.estimateRadiusOfGroup(mostPopularList)
        this.circlePacker.addCircle(mostPopularVersion, popularRadius)

        this._transferAttractorsPositionFromPacker()
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

    _createVersionAttractors(nodeObjects) {
        this._packAttractorPositions(nodeObjects)
        this._makeLabels()
        this._currentVersionSet = this._collectVersions(nodeObjects)
    }

    _makeLabels() {
        const packedPositions = this.circlePacker.getResults()
        for (const [version, {position}] of _.entries(packedPositions)) {
            const attr = this.attractors[version]
            if (attr) {
                const text = version === '0.0.0' ? 'Unknown' : `v. ${version}`
                this.makeLabel({
                    text,
                    position: new THREE.Vector3(position.x, position.y - attr.relaxRadius * 1.1 - 20.0, 50.0),
                    scale: 2.5
                })
            }
        }
    }
}
