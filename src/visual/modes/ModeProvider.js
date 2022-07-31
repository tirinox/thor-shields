import {ModeBase} from "@/visual/modes/ModeBase";
import {CirclePack} from "@/helpers/physics/CirclePack";
import _ from "lodash";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import {Config} from "@/config";
import {IPAddressInfoLoader, UNKNOWN} from "@/helpers/data/IPAddressInfo";
import {NodeObject} from "@/visual/NodeObject";


export class ModeProvider extends ModeBase {
    constructor(scene) {
        super(scene);
        this._attractorBanish = new Attractor(new THREE.Vector3(0, 0, 0), -100.0)
        this.attractors = {}
        this.force = Config.Physics.BaseForce
        this.circlePacker = new CirclePack(this.force, 1400, 300, 0.02, 1)
    }

    update() {
        // this.circlePacker.pack(dt)
        this._transferAttractorsPositionFromPacker()
    }

    handleObject(physObj) {
        super.handleObject(physObj);

        if (physObj) {
            let groupName = IPAddressInfoLoader.refineProviderName(
                (physObj.ipInfo && physObj.ipInfo.providerName) ? physObj.ipInfo.providerName : UNKNOWN
            )
            physObj.attractors = [(this.attractors[groupName] ?? this._attractorBanish)]
        }
    }

    onEnter(objList) {
        this._createProviderAttractors(objList)
        super.onEnter();
    }

    _createProviderAttractors(objList) {
        const providers = {}

        let mostPopularProvider = null
        let mostPopularCount = 0

        for (const nodeObj of objList) {
            const ipInfo = nodeObj.ipInfo
            const nativeName = ipInfo ? ipInfo.providerName : UNKNOWN
            const provider = IPAddressInfoLoader.refineProviderName(nativeName)

            if(!providers[provider]) {
                providers[provider] = [nodeObj]
            } else {
                const list = providers[provider]
                list.push(nodeObj)
                if(list.length > mostPopularCount) {
                    mostPopularProvider = provider
                    mostPopularCount = list.length
                }
            }
        }

        this.circlePacker.clear()
        this.attractors = {}
        const sortedEntries = _.sortBy(_.entries(providers), [(pair) => pair[1].length])
        // const sortedEntries = _.entries(providers)
        for (const [name, items] of sortedEntries) {
            if(name === mostPopularProvider) {
                continue
            }

            this._makeAttractor(name, items, true)
        }
        this.circlePacker.arrangeAroundCenter()
        this._transferAttractorsPositionFromPacker()

        if(mostPopularProvider) {
            this._makeAttractor(mostPopularProvider, providers[mostPopularProvider], false)
        }

        this._makeLabels(providers, mostPopularProvider)
    }

    _makeAttractor(name, items, addCircle) {
        const circleRadius = NodeObject.estimateRadiusOfGroup(items) * 0.9
        // console.log('prov', name, circleRadius)

        if(addCircle) {
            this.circlePacker.addCircle(name, circleRadius)
        }

        this.attractors[name] = new Attractor(new THREE.Vector3(),
            this.force, 0, 0, 0, circleRadius)
        return circleRadius
    }

    _makeLabelForGroup(providers, name, position) {
        const countNodes = providers[name].length
        const title = `${name} (${countNodes})`
        this.makeLabel(title, new THREE.Vector3(position.x, position.y - 180.0, 60.0), 5)
    }

    _makeLabels(providers, mostPopularName) {
        const packedPositions = this.circlePacker.getResults()
        for (const [name, {position}] of _.entries(packedPositions)) {
            this._makeLabelForGroup(providers, name, position)
        }

        if(mostPopularName) {
            this._makeLabelForGroup(providers, mostPopularName, new THREE.Vector3())
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