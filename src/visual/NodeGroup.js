import {Random} from "@/helpers/MathUtil";
import {NodeObject} from "@/visual/NodeObject";
import _ from "lodash";
import {NodeStatus} from "@/helpers/NodeTracker";
import {NodeEvent} from "@/helpers/NodeEvent";
import {clearObject} from "@/helpers/3D";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import {Config} from "@/config";
import CirclePacker from "circlepacker";

export const NodeGroupModes = Object.freeze({
    Normal: 'normal',
    Status: 'status',
    Provider: 'provider',
})

export class NodeGroup {
    constructor(parent) {
        this._mode = NodeGroupModes.Normal
        this.parent = parent
        this._tracker = {}
        this._currentIdent = 0

        this.bounds = {
            xMin: -60, xMax: 60,
            yMin: -40, yMax: 40,
            zMin: 0, zMax: 0,
        }

        this._circleRadius = 350.0
        const force = 500.0

        this._attractorBanish = new Attractor(new THREE.Vector3(), -100.0)

        this.modeAttractors = {
            [NodeGroupModes.Normal]: {
                global: new Attractor(new THREE.Vector3(),
                    force, 0, 0, 0, this._circleRadius),
                standByOuter: new Attractor(new THREE.Vector3(),
                    -0.25 * force),
            },
            [NodeGroupModes.Status]: {
                [NodeStatus.Active]: [
                    new Attractor(new THREE.Vector3(-250.0, 0, 0), force, 0, 0, 0, this._circleRadius),
                ],
                [NodeStatus.Standby]: [
                    new Attractor(new THREE.Vector3(380.0, 200, 0), force, 0, 0, 0, this._circleRadius * 0.3),
                    new Attractor(new THREE.Vector3(380.0, 200, 0), force * 0.02),
                ],
                '*': [
                    new Attractor(new THREE.Vector3(380.0, -200, 0), force, 0, 0, 0, this._circleRadius * 0.3),
                    new Attractor(new THREE.Vector3(380.0, -200, 0), force * 0.02),
                ],
            },
            [NodeGroupModes.Provider]: {},
        }
    }

    genIdent(node) {
        return node.node_address ?? String(this._currentIdent++)
    }

    findNodeObject(ident) {
        return this._tracker[ident]
    }

    _placeNodeObject(nodeObject) {
        const pos = Random.randomVector(this.bounds)
        nodeObject.o.position.copy(pos)
        this.parent.add(nodeObject.o)
    }

    createNewNode(node) {
        const ident = this.genIdent(node)
        const existing = this.findNodeObject(ident)
        if (existing) {
            console.warn('NodeObject already exists. No nothing')
            return existing
        }

        console.info(`Create node ${ident}.`)

        const nodeObject = new NodeObject(node)
        nodeObject.friction = 0.02
        this.parent.add(nodeObject.o)
        this._placeNodeObject(nodeObject)
        this._tracker[ident] = nodeObject
        return nodeObject
    }

    destroyNode(node) {
        const nodeAddress = node.node_address ?? node
        const nodeObject = this.findNodeObject(nodeAddress)
        if (!nodeObject) {
            console.error('node not found!')
            return
        }

        console.info(`Destroy node ${nodeAddress}.`)
        nodeObject.dispose()
        this.parent.remove(nodeObject.o)
        delete this._tracker[nodeAddress]
    }

    _repelForceCalculation(obj) {
        const forceMult = 101.0
        for (const otherObj of this.nodeObjList) {
            if (otherObj !== obj) {
                obj.repel(otherObj, forceMult)
            }
        }
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

        if (!obj.ipInfo || !obj.ipInfo.asname) {
            obj.attractors = [this._attractorBanish]
            return
        }

        const attractor = attractors[obj.ipInfo.asname]
        if (attractor) {
            obj.attractors = [attractor]
        } else {
            obj.attractors = [this._attractorBanish]
        }

    }

    get defaultAttractor() {
        return this.modeAttractors[NodeGroupModes.Normal].global
    }

    set mode(newMode) {
        this._mode = newMode
        if (this._mode === NodeGroupModes.Provider) {
            this._updateProviderAttractors()
        }
    }

    _updateProviderAttractors() {
        const attractors = this.modeAttractors[NodeGroupModes.Provider] = {}

        const providers = {}
        for (const nodeObj of this.nodeObjList) {
            const ipInfo = nodeObj.ipInfo
            if (ipInfo) {
                const provider = ipInfo.asname
                const current = providers[provider] ?? 0
                providers[provider] = current + 1
            }
        }

        const cx = 400
        const cy = 400

        const circles = []
        for (const [name, count] of _.entries(providers)) {
            circles.push(
                {
                    id: name,
                    radius: Math.sqrt(count) * 30,
                    position: {x: Random.getRandomFloat(0, cx * 2), y: Random.getRandomFloat(0, cy * 2)},
                    isPulledToCenter: true,
                    isPinned: false
                },
            )
        }

        console.log(circles)

        const packer = new CirclePacker({
            collisionPasses: 100,
            centeringPasses: 500,

            target: {x: cx, y: cy},
            bounds: {width: cx * 2, height: cy * 2},
            continuousMode: false,
            circles,
            onMove: (poses) => {
                for (const [name, circle] of _.entries(poses)) {
                    const target = new THREE.Vector3(circle.position.x - cx, circle.position.y - cy, 0.0)
                    attractors[name] = new Attractor(target,
                        800.0, 0, 0, 0.0, circle.radius)
                }
            }
        })
        packer.update()
    }

    _updateObject(obj, delta) {
        obj.nullifyForce()

        const attractors = this.modeAttractors[this._mode]
        if (this._mode === NodeGroupModes.Normal) {
            this._handleNormalMode(obj, attractors)
        } else if (this._mode === NodeGroupModes.Status) {
            this._handleStatusMode(obj, attractors)
        } else if (this._mode === NodeGroupModes.Provider) {
            this._handleProviderMode(obj, attractors)
        }

        this._repelForceCalculation(obj)

        // update
        obj.update(delta)
    }

    update(dt) {
        if (isNaN(dt)) {
            return
        }
        _.forEach(this.nodeObjList, obj => this._updateObject(obj, dt))
    }

    get nodeObjList() {
        return _.values(this._tracker)
    }

    reactEvent(event) {
        const delay = Random.getRandomFloat(0, Config.DataSource.ReactRandomDelay * 1000.0)
        setTimeout(() => {
            const obj = this.findNodeObject(event.node.node_address)
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
        clearObject(this.parent)
        for (const otherObj of this.nodeObjList) {
            otherObj.dispose()
        }
        this._tracker = {}
    }
}