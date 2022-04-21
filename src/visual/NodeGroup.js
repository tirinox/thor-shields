import {Random} from "@/helpers/MathUtil";
import {NodeObject} from "@/visual/NodeObject";
import _ from "lodash";
import {NodeStatus} from "@/helpers/NodeTracker";
import {NodeEvent} from "@/helpers/NodeEvent";
import {clearObject} from "@/helpers/3D";
import {Attractor} from "@/helpers/physics/Attractor";
import * as THREE from "three";

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

        this._attractor = new Attractor(new THREE.Vector3(), 1.0)
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
        for(const otherObj of _.values(this._tracker)) {
            if (otherObj !== obj) {
                obj.repel(otherObj, forceMult)
            }
        }
    }

    update(dt) {
        if (isNaN(dt)) {
            return
        }

        const circleRadius = 350.0

        for (const obj of _.values(this._tracker)) {
            // set force

            const distance = obj.o.position.length()

            const toCenter = obj.o.position.clone().normalize()
            if(distance > circleRadius) {
                // outside the circle everybody want to go back in
                obj.force.copy(toCenter.multiplyScalar(-200.0))
                obj.friction = 0.0
            } else {
                obj.force.set(0, 0, 0)
                obj.friction = 0.02
                if(obj.node.status === NodeStatus.Active) {
                    // active tends to the center
                    obj.force.add(toCenter.multiplyScalar(-10.0 * obj.normalizedBond))
                } else {
                    // other one seeks to go to the frontier
                    obj.force.add(toCenter.multiplyScalar(50.0))
                }
            }

            this._repelForceCalculation(obj)

            // update
            obj.update(dt)
        }

        // todo: remove
        if(Math.random() > 0.9) {
            const obj = Random.getRandomSample(_.values(this._tracker))
            if(obj) {
                obj.reactChain()
            }
        }
    }

    reactEvent(event) {
        const obj = this.findNodeObject(event.node.node_address)
        if(obj) {
            if(event.type === NodeEvent.EVENT_TYPE.OBSERVE_CHAIN) {
                obj.reactChain()
            } else if(event.type === NodeEvent.EVENT_TYPE.SLASH) {
                obj.reactSlash()
            }
        }
    }

    dispose() {
        clearObject(this.parent)
        for(const otherObj of _.values(this._tracker)) {
            otherObj.dispose()
        }
        this._tracker = {}
    }
}