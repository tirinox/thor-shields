import {Random} from "@/helpers/MathUtil";
import {NodeObject} from "@/visual/NodeObject";
import _ from "lodash";

export class NodeGroup {
    constructor(parent) {
        this.parent = parent
        this._tracker = {}
        this._currentIdent = 0

        this.bounds = {
            xMin: -600, xMax: 600,
            yMin: -400, yMax: 400,
            zMin: 0, zMax: 0,
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
        if (this.findNodeObject(ident)) {
            console.warn('NodeObject already exists. No nothing')
            return
        }

        console.info(`Create node ${ident}.`)

        const nodeObject = new NodeObject(node)
        this.parent.add(nodeObject.o)
        this._placeNodeObject(nodeObject)
        this._tracker[ident] = nodeObject

        const force = nodeObject.o.position.clone().normalize()
        nodeObject.force.copy(force.multiplyScalar(-200.0))
    }

    destroyNode(node) {
        const nodeAddress = node.node_address ?? node
        const nodeObject = this.findNodeObject(nodeAddress)
        if (!nodeObject) {
            console.error('node not found!')
            return
        }

        console.info(`Create node ${nodeAddress}.`)

        this.parent.remove(nodeObject.o)
        delete this._tracker[nodeAddress]
    }

    update(dt) {
        if (isNaN(dt)) {
            return
        }

        for (const node of _.values(this._tracker)) {
            node.update(dt)
        }
    }
}