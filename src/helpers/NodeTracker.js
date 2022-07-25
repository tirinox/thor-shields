import _ from "lodash";
import {NodeEvent} from "@/helpers/NodeEvent";

export const NodeStatus = {
    Standby: 'Standby',
    Whitelisted: 'Whitelisted',
    Disabled: 'Disabled',
    Active: 'Active',
    Unknown: 'Unknown',
}

export class NodeTracker {
    constructor(prevNodeList, currNodeList) {
        this.prev = prevNodeList
        this.curr = currNodeList
    }

    extractEvents() {
        const events = []
        const addEvent = (t, node, prevNode, k) => {
            k = k || 'address'
            events.push(new NodeEvent(t, node, prevNode, node ? node[k] : '',
                prevNode ? prevNode[k] : ''))
        }

        const addedNodeAddresses = _.difference(this.curr.nameSet, this.prev.nameSet)
        for (const addr of addedNodeAddresses) {
            const node = this.curr.byAddress[addr]
            addEvent(NodeEvent.EVENT_TYPE.CREATE, node, node)
        }

        const removeNodeAddresses = _.difference(this.prev.nameSet, this.curr.nameSet)
        for (const addr of removeNodeAddresses) {
            const node = this.prev.byAddress[addr]
            addEvent(NodeEvent.EVENT_TYPE.DESTROY, node, node)
        }

        const EVENT_TYPES = NodeEvent.EVENT_TYPE

        const keyTypeTable = {
            'slashPoints': EVENT_TYPES.SLASH,
            'bond': EVENT_TYPES.BOND_CHANGE,
            'IPAddress': EVENT_TYPES.IP_ADDRESS,
            'status': EVENT_TYPES.STATUS,
            'height': EVENT_TYPES.ACTIVE_BLOCK_HEIGHT,
            'currentAward': EVENT_TYPES.AWARD,
            'observeChains': EVENT_TYPES.OBSERVE_CHAIN,
            'version': EVENT_TYPES.VERSION,
        }

        const commonNodes = _.intersection(this.curr.nameSet, this.prev.nameSet)
        for (const addr of commonNodes) {
            const prevNode = this.prev.byAddress[addr]
            const currNode = this.curr.byAddress[addr]
            const keys = _.union(_.keys(prevNode), _.keys(currNode));
            const keysChanged = _.filter(keys, (key) => {
                return !_.isEqual(prevNode[key], currNode[key]);
            });
            for (const key of keysChanged) {
                const eventType = keyTypeTable[key]
                if (eventType) {
                    addEvent(eventType, currNode, prevNode, key)
                }
            }
        }

        return events
    }
}
