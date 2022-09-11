import {ModeBase} from "@/visual/modes/ModeBase";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import _ from "lodash";
import {Config} from "@/config";
import {NodeEvent} from "@/helpers/NodeEvent";
import {Version} from "@/helpers/data/Version";
import {NodeObject} from "@/visual/NodeObject";

export class ModeVersion extends ModeBase {
    constructor(scene) {
        super(scene);

        this._circleRadius = 350.0
        this._sideDistance = 600

        this.force = Config.Physics.BaseForce
        this._attractors = {}

        this._attractorBanish = new Attractor(new THREE.Vector3(0, 0, 0), -100.0)

        this._currentVersionSet = []

        this._versionDist = {}
    }

    _collectVersions(nodeObjects) {
        return _.uniq(_.map(nodeObjects, 'node.version'))
    }

    reactEvent(event, nodeObjects) {
        // fixme: if there are multiple new versions, then it re-creates attractors multiple times per tick!!
        if (event.type === NodeEvent.EVENT_TYPE.VERSION) {
            if (!this._attractors[event.currValue]) {
                console.log(`New version detected: ${event.currValue}`)
                this.clearLabels()
                this._packAttractorPositions(nodeObjects)
                this._juggleLabels(nodeObjects)
                this._makeLabels()
            }
        }
    }

    handleObject(physObj) {
        if (physObj) {
            let groupName = physObj.node.version
            physObj.attractors = (this._attractors[groupName] ?? this._attractorBanish)
        }
    }

    onEnter(objList) {
        this._createVersionAttractors(objList)
        this.makeLabel({
            text: 'Versions',
            position: new THREE.Vector3(0, -630, -10), scale: 14
        })
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

    _packAttractorPositions(objList) {
        this._versionDist = Version.getSemanticVersionsDistribution(objList)

        const gap = 150.0
        const radAttr = 1.2

        let nGroups = 0
        let radSum = 0.0
        for (const versionDesc of _.values(this._versionDist)) {
            versionDesc.radius = radAttr * NodeObject.estimateRadiusOfGroup(versionDesc.objects)
            ++nGroups
            radSum += versionDesc.radius
        }
        radSum += Math.max(0, nGroups - 1) * gap

        let x = -radSum * 0.5
        this._attractors = {}
        for (const [key, versionDesc] of _.entries(this._versionDist)) {
            const attractor = new Attractor(new THREE.Vector3(x, 0, 0),
                this.force, 0, 0, 0, versionDesc.radius)
            x += gap + versionDesc.radius
            this._attractors[key] = attractor
            for (const nodeObj of versionDesc.objects) {
                this._attractors[nodeObj.node.version] = attractor
            }
        }
    }

    _createVersionAttractors(nodeObjects) {
        this._packAttractorPositions(nodeObjects)
        this._makeLabels()
        this._currentVersionSet = this._collectVersions(nodeObjects)
    }

    _makeLabels() {
        for (const [key, versionDesc] of _.entries(this._versionDist)) {
            const attr = this._attractors[key]
            if (attr) {
                this.makeLabel({
                    text: key,
                    position: new THREE.Vector3(attr.position.x, attr.position.y - attr.relaxRadius * 1.1 - 20.0, 50.0),
                    scale: 2.5
                })

                if (versionDesc.comment !== key) {
                    this.makeLabel({
                        text: versionDesc.comment,
                        position: new THREE.Vector3(attr.position.x, attr.position.y - attr.relaxRadius * 1.1 - 60.0, 50.0),
                        scale: 4.0,
                    })
                }
            }
        }
    }
}
