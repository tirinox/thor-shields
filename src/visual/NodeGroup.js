import {Random} from "@/helpers/MathUtil";
import {NodeObject} from "@/visual/NodeObject";
import {clearObject} from "@/helpers/3D";
import {Config} from "@/config";
import {Simulation} from "@/helpers/physics/Simulation";
import {ModeNormal} from "@/visual/modes/ModeNormal";
import {ModeStatus} from "@/visual/modes/ModeStatus";
import {ModeProvider} from "@/visual/modes/ModeProvider";
import {ModeVersion} from "@/visual/modes/ModeVersion";
import {ModeBond} from "@/visual/modes/ModeBond";
import {ModeGeo} from "@/visual/modes/ModeGeo";
import * as THREE from "three";
// import {VisNetwork} from "@/visual/VisNetwork";

export const NodeGroupModes = Object.freeze({
    Normal: 'normal',
    Status: 'status',
    Provider: 'provider',
    Version: 'version',
    Bond: 'bond',
    Geo: 'geo',
})

export class NodeGroup extends Simulation {
    constructor(parent) {
        super()

        this.holder = new THREE.Group()
        parent.add(this.holder)

        this._currentIdent = 0
        this.parent = parent

        this._modeNormal = new ModeNormal(this.parent)
        this._modeStatus = new ModeStatus(this.parent)
        this._modeProvider = new ModeProvider(this.parent)
        this._modeVersion = new ModeVersion(this.parent)
        this._modeBond = new ModeBond(this.parent)
        this._modeGeo = new ModeGeo(this.parent)

        this._selector = {
            [NodeGroupModes.Normal]: this._modeNormal,
            [NodeGroupModes.Status]: this._modeStatus,
            [NodeGroupModes.Provider]: this._modeProvider,
            [NodeGroupModes.Version]: this._modeVersion,
            [NodeGroupModes.Bond]: this._modeBond,
            [NodeGroupModes.Geo]: this._modeGeo,
        }

        this._selectedModeHandler = this._modeNormal
        this.mode = NodeGroupModes.Normal

        this.repelForce = Config.Physics.RepelForce

        // this._visNet = new VisNetwork()
        // this.parent.add(this._visNet)
    }

    genIdent(node) {
        return node.address ?? String(this._currentIdent++)
    }

    _placeNodeObject(nodeObject) {
        // const pos = Random.randomVector(this._startPositionBounds)
        const pos = Random.randomOnCircle(2000.0)
        nodeObject.o.position.copy(pos)
        this.holder.add(nodeObject.o)
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
        this._placeNodeObject(nodeObject)
        this.addObject(ident, nodeObject)
        return nodeObject
    }

    destroyNode(node) {
        const nodeAddress = node.address ?? node
        const nodeObject = this.getByName(nodeAddress)
        if (!nodeObject) {
            console.error('node not found!')
            return
        }

        console.info(`Destroy node ${nodeAddress}.`)
        nodeObject.dispose()
        this.holder.remove(nodeObject.o)
        super.removeObject(nodeAddress)
    }

    set mode(newMode) {
        if(this._mode === newMode) {
            return
        }

        this._mode = newMode

        // dispose old
        this._selectedModeHandler._triggerOnLeave(this.physicalObjects, this)

        // pick new
        this._selectedModeHandler = this._selector[this._mode]

        // enter the new one
        this._selectedModeHandler._triggerOnEnter(this.physicalObjects, this)

        console.log(`Set Mode: ${newMode}`)
    }

    _updateObject(obj, delta) {
        this._selectedModeHandler.handleObject(obj)
        super._updateObject(obj, delta)
    }

    reactEvent(event) {
        const delay = Random.getRandomFloat(0, Config.DataSource.ReactRandomDelay)
        setTimeout(() => {
            const obj = this.getByName(event.node.address)
            if (obj) {
                obj.react(event)
            }
        }, delay)
    }

    update(dt) {
        this._selectedModeHandler.update(dt)

        super.update(dt)

        // this._visNet.update(dt)
        // this._visNet.updatePositions(this.rBush, this.objectPositions)
    }

    dispose() {
        super.dispose()
        clearObject(this.holder)
        for (const otherObj of this.physicalObjects) {
            otherObj.dispose()
        }
    }

    setElevatedNode(name) {
        for(const obj of this.physicalObjects) {
            obj.elevated = (obj.name === name)
        }
    }
}
