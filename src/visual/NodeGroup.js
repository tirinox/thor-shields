import {Random} from "@/helpers/MathUtil";
import {NodeObject} from "@/visual/NodeObject";
import _ from "lodash";
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";

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

        console.info(`Create node ${nodeAddress}.`)
        nodeObject.dispose()
        this.parent.remove(nodeObject.o)
        delete this._tracker[nodeAddress]
    }

    update(dt) {
        if (isNaN(dt)) {
            return
        }

        const radius = 300.0

        for (const obj of _.values(this._tracker)) {
            // set force

            const distance = obj.o.position.length()

            if(distance > radius) {
                const force = obj.o.position.clone()
                obj.force.copy(force.multiplyScalar(-2.0))
                obj.friction = 0.0
            } else {
                const v = Random.randomVector({}).normalize().multiplyScalar(100)
                obj.force.set(v.x, v.y, 0)
                obj.friction = 0.02
            }

            // update
            obj.update(dt)
        }
    }

    reactSlash(node) {
        console.info('slash')
        const obj = this.findNodeObject(node.node_address)
        const velocity = obj.o.position.clone().normalize().multiplyScalar(100)
        obj.velocity.copy(velocity)
    }

    reactChain(node) {
        console.info(`${node.node_address} chain`)

        const obj = this.findNodeObject(node.node_address)

        new TWEEN.Tween(obj.o.scale)
            .to(
                {
                    x: 1.1,
                    y: 1.1,
                    z: 1.1
                },
                300
            )
            .to( {
                x: 1.0,
                y: 1.0,
                z: 1.0
            }, 300)
            //.delay (1000)
            .easing(TWEEN.Easing.Cubic.Out)
            //.onUpdate(() => render())
            .start()

    }
}