import {Random} from "@/helpers/MathUtil";
import {NodeObject} from "@/visual/NodeObject";
import {NodeEvent} from "@/helpers/NodeEvent";
import {clearObject} from "@/helpers/3D";
import {Config} from "@/config";
import {Simulation} from "@/helpers/physics/Simulation";
import {ModeNormal} from "@/visual/modes/ModeNormal";
import {ModeStatus} from "@/visual/modes/ModeStatus";
import {ModeProvider} from "@/visual/modes/ModeProvider";

export const NodeGroupModes = Object.freeze({
    Normal: 'normal',
    Status: 'status',
    Provider: 'provider',
})

export class NodeGroup extends Simulation {
    constructor(parent) {
        super()

        this._currentIdent = 0
        this.parent = parent

        this._modeNormal = new ModeNormal(this.parent)
        this._modeStatus = new ModeStatus(this.parent)
        this._modeProvider = new ModeProvider(this.parent)

        this._selectedModeHandler = this._modeNormal
        this.mode = NodeGroupModes.Normal

        this._startPositionBounds = {
            xMin: -60, xMax: 60,
            yMin: -40, yMax: 40,
            zMin: 0, zMax: 0,
        }
    }

    genIdent(node) {
        return node.node_address ?? String(this._currentIdent++)
    }

    _placeNodeObject(nodeObject) {
        // const pos = Random.randomVector(this._startPositionBounds)
        const pos = Random.randomOnCircle(2000.0)
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

    set mode(newMode) {
        this._mode = newMode

        this._selectedModeHandler.onLeave()

        if (this._mode === NodeGroupModes.Normal) {
            this._selectedModeHandler = this._modeNormal
        } else if(this._mode === NodeGroupModes.Status) {
            this._selectedModeHandler = this._modeStatus
        } else if(this._mode === NodeGroupModes.Provider) {
            this._modeProvider.createProviderAttractors(this.nodeObjList)
            this._selectedModeHandler = this._modeProvider
        }

        this._selectedModeHandler.onEnter()

        console.log(`Set Mode: ${newMode}`)
    }

    _updateObject(obj, delta) {
        this._selectedModeHandler.handleObject(obj)
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

    update(dt) {
        this._selectedModeHandler.update(dt)
        return super.update(dt);
    }

    dispose() {
        super.dispose()
        clearObject(this.parent)
        for (const otherObj of this.nodeObjList) {
            otherObj.dispose()
        }
    }
}