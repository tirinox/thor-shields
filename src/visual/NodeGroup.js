import {Random} from "@/helpers/MathUtil";
import {NodeObject} from "@/visual/NodeObject";
import _ from "lodash";
import {NodeStatus} from "@/helpers/NodeTracker";
import {NodeEvent} from "@/helpers/NodeEvent";
import {clearObject} from "@/helpers/3D";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";
import {Config} from "@/config";

export class NodeGroup {
    constructor(parent) {
        this.parent = parent
        this._tracker = {}
        this._currentIdent = 0

        this.bounds = {
            xMin: -60, xMax: 60,
            yMin: -40, yMax: 40,
            zMin: 0, zMax: 0,
        }

        this._circleRadius = 350.0
        this._attractorGlobal = new Attractor(new THREE.Vector3(), 200.0)
        this._attractorStandby = new Attractor(new THREE.Vector3(), -50.0)
        this._attractorActive = new Attractor(new THREE.Vector3(), 10.0)
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
        if (this.findNodeObject(ident)) {
            console.warn('NodeObject already exists. No nothing')
            return
        }

        console.info(`Create node ${ident}.`)

        const nodeObject = new NodeObject(node)
        nodeObject.attractor = this._attractor
        this.parent.add(nodeObject.o)
        this._placeNodeObject(nodeObject)
        this._tracker[ident] = nodeObject
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
        for (const otherObj of _.values(this._tracker)) {
            if (otherObj !== obj) {
                obj.repel(otherObj, forceMult)
            }
        }
    }

    update(dt) {
        if (isNaN(dt)) {
            return
        }

        for (const obj of _.values(this._tracker)) {
            obj.nullifyForce()

            const distance = obj.o.position.length()
            const toCenter = obj.o.position.clone().normalize()
            if (distance > this._circleRadius) {
                // outside the circle everybody want to go back in
                obj.friction = 0.0
                obj.attractors = [this._attractorGlobal]
            } else {
                obj.attractors = []
                obj.friction = 0.02
                if (obj.node.status === NodeStatus.Active) {
                    // obj.attractors = [this._attractorActive]
                    // active tends to the center
                    // obj.force.add(toCenter.multiplyScalar(10.0 * obj.normalizedBond))
                    +toCenter
                } else {
                    // other one seeks to go to the frontier
                    obj.attractors = [this._attractorStandby]
                }
            }

            this._repelForceCalculation(obj)

            // update
            obj.update(dt)
        }
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
        for (const otherObj of _.values(this._tracker)) {
            otherObj.dispose()
        }
        this._tracker = {}
    }
}