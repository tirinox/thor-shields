import {Random} from "@/helpers/MathUtil";
import {NodeObject} from "@/visual/NodeObject";
import _ from "lodash";
import {NodeStatus} from "@/helpers/NodeTracker";
import {NodeEvent} from "@/helpers/NodeEvent";
import {clearObject} from "@/helpers/3D";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import {Config} from "@/config";
import {Simulation} from "@/helpers/physics/Simulation";
import {CirclePackMy} from "@/helpers/physics/CirclePack";

export const NodeGroupModes = Object.freeze({
    Normal: 'normal',
    Status: 'status',
    Provider: 'provider',
})

export class NodeGroup extends Simulation {
    constructor(parent) {
        super()
        this._mode = NodeGroupModes.Normal
        this._currentIdent = 0
        this.parent = parent

        this.bounds = {
            xMin: -60, xMax: 60,
            yMin: -40, yMax: 40,
            zMin: 0, zMax: 0,
        }

        this._circleRadius = 350.0
        const force = this.force = 1500.0

        this._attractorBanish = new Attractor(new THREE.Vector3(0, 0, 0), 100.0)

        this.modeAttractors = {
            [NodeGroupModes.Normal]: {
                global: new Attractor(new THREE.Vector3(),
                    force, 0, 0, 0, this._circleRadius),
                standByOuter: new Attractor(new THREE.Vector3(),
                    -0.25 * force),
            },
            [NodeGroupModes.Status]: {
                [NodeStatus.Active]: [
                    new Attractor(new THREE.Vector3(0.0, 0, 0), force, 0, 0, 0, this._circleRadius),
                ],
                [NodeStatus.Standby]: [
                    new Attractor(new THREE.Vector3(-500.0, 0, 0), force, 0, 0, 0, this._circleRadius * 0.3),
                    new Attractor(new THREE.Vector3(-500.0, 0, 0), force * 0.02),
                ],
                '*': [
                    new Attractor(new THREE.Vector3(500.0, 0, 0), force, 0, 0, 0, this._circleRadius * 0.3),
                    new Attractor(new THREE.Vector3(500.0, 0, 0), force * 0.02),
                ],
            },
            [NodeGroupModes.Provider]: {},
        }
    }

    genIdent(node) {
        return node.node_address ?? String(this._currentIdent++)
    }

    _placeNodeObject(nodeObject) {
        const pos = Random.randomVector(this.bounds)
        nodeObject.o.position.copy(pos)
        this.parent.add(nodeObject.o)
    }

    createNewNode(node) {
        const ident = this.genIdent(node)
        const existing = this.getByName(ident)
        if (existing) {
            console.warn('NodeObject already exists. No nothing')
            return existing
        }

        console.info(`Create node ${ident}.`)

        const nodeObject = new NodeObject(node)
        this.parent.add(nodeObject.o)
        this._placeNodeObject(nodeObject)
        this.addObject(ident, nodeObject)
        return nodeObject
    }

    destroyNode(node) {
        const nodeAddress = node.node_address ?? node
        const nodeObject = this.getByName(nodeAddress)
        if (!nodeObject) {
            console.error('node not found!')
            return
        }

        console.info(`Destroy node ${nodeAddress}.`)
        nodeObject.dispose()
        this.parent.remove(nodeObject.o)
        super.removeObject(nodeAddress)
    }

    _handleNormalMode(obj, attractors) {
        const distance = obj.o.position.length()
        // const toCenter = obj.o.position.clone().normalize()
        if (distance > this._circleRadius) {
            // outside the circle everybody want to go back in
            obj.attractors = [attractors.global]
        } else {
            obj.attractors = []
            if (obj.node.status !== NodeStatus.Active) {
                obj.attractors = [attractors.standByOuter]
            }
        }
    }

    _handleStatusMode(obj, attractors) {
        obj.attractors = []

        const bestAttractors = attractors[obj.node.status]
        if (bestAttractors) {
            obj.attractors = bestAttractors
        } else {
            obj.attractors = attractors['*']
        }
    }

    _handleProviderMode(obj, attractors) {
        if (!obj) {
            return;
        }

        let groupName = 'unknown'
        if (obj.ipInfo && obj.ipInfo.asname) {
            groupName = obj.ipInfo.asname
        }

        const attractor = attractors[groupName]
        if (attractor) {
            obj.attractors = [attractor]
        } else {
            obj.attractors = [this._attractorBanish]
        }
    }

    set mode(newMode) {
        this._mode = newMode
        if (this._mode === NodeGroupModes.Provider) {
            this._updateProviderAttractors()
        }
    }

    _updateProviderAttractors() {
        const providers = {}
        for (const nodeObj of this.nodeObjList) {
            const ipInfo = nodeObj.ipInfo
            const provider = ipInfo ? ipInfo.asname : 'unknown'
            const current = providers[provider] ?? 0
            providers[provider] = current + 1
        }

        const packer = new CirclePackMy(1000, 2000, 5000)
        for (const [name, count] of _.entries(providers)) {
            packer.addCircle(name, Math.sqrt(+count) * 30.0)
        }
        const packedPositions = packer.pack()
        const attractors = {}
        for (const [name, {position, radius}] of _.entries(packedPositions)) {
            attractors[name] = new Attractor(position,
                this.force, 0, 0, 0, radius * 0.7)
        }
        this.modeAttractors[NodeGroupModes.Provider] = attractors

    }

    _updateObject(obj, delta) {
        const attractors = this.modeAttractors[this._mode]
        if (this._mode === NodeGroupModes.Normal) {
            this._handleNormalMode(obj, attractors)
        } else if (this._mode === NodeGroupModes.Status) {
            this._handleStatusMode(obj, attractors)
        } else if (this._mode === NodeGroupModes.Provider) {
            this._handleProviderMode(obj, attractors)
        }

        super._updateObject(obj, delta)
    }

    reactEvent(event) {
        const delay = Random.getRandomFloat(0, Config.DataSource.ReactRandomDelay * 1000.0)
        setTimeout(() => {
            const obj = this.getByName(event.node.node_address)
            if (obj) {
                if (event.type === NodeEvent.EVENT_TYPE.OBSERVE_CHAIN) {
                    obj.reactChain()
                } else if (event.type === NodeEvent.EVENT_TYPE.SLASH) {
                    obj.reactSlash()
                }
            }
        }, delay)
    }

    dispose() {
        super.dispose()
        clearObject(this.parent)
        for (const otherObj of this.nodeObjList) {
            otherObj.dispose()
        }
    }
}