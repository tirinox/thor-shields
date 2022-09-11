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
        this._attractorsByKey = {}
        this._attractorsByVersion = {}

        this._attractorBanish = new Attractor(new THREE.Vector3(0, 0, 0), -100.0)

        this._previousKeys = []
        this._versionDist = {}
    }

    reactEvent(event, nodeObjects) {
        if (event.type === NodeEvent.EVENT_TYPE.VERSION) {
            console.log(`New version detected: ${event.currValue}`)
            this._packAttractorPositions(nodeObjects)
            this._makeLabels()
        }
    }

    handleObject(physObj) {
        if (physObj) {
            let groupName = physObj.node.version
            physObj.attractors = (this._attractorsByVersion[groupName] ?? this._attractorBanish)
        }
    }

    onEnter(nodeObjects) {
        this._packAttractorPositions(nodeObjects)
        this._makeLabels()

        this.makeLabel({
            text: 'Versions',
            position: new THREE.Vector3(0, -630, -10), scale: 14
        })
    }

    _packAttractorPositions(objList) {
        this._versionDist = Version.getSemanticVersionsDistribution(objList)

        const gap = 100.0
        const radAttr = 1.2

        let nGroups = 0
        let radSum = 0.0
        for (const versionDesc of _.values(this._versionDist)) {
            versionDesc.radius = radAttr * NodeObject.estimateRadiusOfGroup(versionDesc.objects)
            ++nGroups
            radSum += 2 * versionDesc.radius
        }
        radSum += Math.max(0, nGroups - 1) * gap

        let x = -radSum * 0.5
        this._attractorsByVersion = {}
        this._attractorsByKey = {}

        let entries = _.entries(this._versionDist)
        entries = _.sortBy(entries, e => e[0])

        for (const [key, versionDesc] of entries) {
            const r = versionDesc.radius
            const attractor = new Attractor(new THREE.Vector3(x + r, 0, 0),
                this.force, 0, 0, 0, versionDesc.radius)
            x += gap + r * 2
            this._attractorsByKey[key] = attractor
            for (const nodeObj of versionDesc.objects) {
                this._attractorsByVersion[nodeObj.node.version] = attractor
            }
        }
    }

    _makeLabels() {
        const affectedKeys = []

        for (const [key, desc] of _.entries(this._versionDist)) {
            affectedKeys.push(key)
            const attr = this._attractorsByKey[key]
            if (attr) {
                let text = `v. ${key} (${desc.objects.length})`
                if(desc.comment.length) {
                    text += '\n' + desc.comment
                }
                const position = new THREE.Vector3(attr.position.x, attr.position.y - attr.relaxRadius * 1.1 - 20.0, 50.0)
                // const position = new THREE.Vector3(attr.position.x, -300.0, 50.0)
                console.log(`${text}: ${position.x}, ${position.y}`)

                this.makeLabel({
                    text,
                    position,
                    scale: 2.5,
                    key
                })
            }
        }

        const keysToRemove = _.difference(this._previousKeys, affectedKeys)
        _.forEach(keysToRemove, key => {
            this.killLabelByKey(key)
        })
        if(keysToRemove.length) {
            console.log(`Removing ${keysToRemove.length} version labels...`)
        }

        this._previousKeys = affectedKeys
    }
}
