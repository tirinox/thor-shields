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
        this.prev = NodeTracker.prepareNodeList(prevNodeList)
        this.curr = NodeTracker.prepareNodeList(currNodeList)
    }

    static convertNode(n) {
        return {
            node_address: n.node_address,
            status: n.status,
            active_block_height: BigInt(n.active_block_height),
            bond: BigInt(n.bond),
            ip_address: n.ip_address,
            current_award: BigInt(n.current_award),
            slash_points: n.slash_points,
            observe_chains: _.sortBy(n.observe_chains, ['chain']),
            requested_to_leave: Boolean(n.requested_to_leave),
            forced_to_leave: Boolean(n.forced_to_leave),
            version: n.version,
            bond_providers: {
                node_address: n.bond_providers.node_address,
                node_operator_fee: BigInt(n.bond_providers.node_operator_fee),
                providers: _.sortBy(n.bond_providers.providers || [], ['bond', 'bond_address']),
            },
            jail: {
                node_address: n.jail.node_address,
                release_height: n.jail.release_height,
                reason: n.jail.reason || ""
            },
        }
    }

    static prepareNodeList(nodeList) {
        nodeList = _.map(nodeList, NodeTracker.convertNode)
        const nodeListWitNames = _.filter(nodeList, (item) => item.node_address)
        const trampCount = nodeList.length - nodeListWitNames.length
        const nodeMap = _.keyBy(nodeListWitNames, 'node_address')
        const nameSet = _.keys(nodeMap)
        return {
            trampCount,
            nodeMap,
            nameSet
        }
    }

    extractEvents() {
        const events = []
        const addEvent = (t, node, prevNode, k) => {
            k = k || 'node_address'
            events.push(new NodeEvent(t, node, prevNode, node ? node[k] : '',
                prevNode ? prevNode[k] : ''))
        }

        const addedNodeAddresses = _.difference(this.curr.nameSet, this.prev.nameSet)
        for (const addr of addedNodeAddresses) {
            const node = this.curr.nodeMap[addr]
            addEvent(NodeEvent.EVENT_TYPE.CREATE, node, node)
        }

        const removeNodeAddresses = _.difference(this.prev.nameSet, this.curr.nameSet)
        for (const addr of removeNodeAddresses) {
            const node = this.prev.nodeMap[addr]
            addEvent(NodeEvent.EVENT_TYPE.DESTROY, node, node)
        }

        const EVENT_TYPES = NodeEvent.EVENT_TYPE

        const keyTypeTable = {
            'slash_points': EVENT_TYPES.SLASH,
            'bond': EVENT_TYPES.BOND_CHANGE,
            'ip_address': EVENT_TYPES.IP_ADDRESS,
            'status': EVENT_TYPES.STATUS,
            'active_block_height': EVENT_TYPES.ACTIVE_BLOCK_HEIGHT,
            'current_award': EVENT_TYPES.AWARD,
            'observe_chains': EVENT_TYPES.OBSERVE_CHAIN,
        }

        const commonNodes = _.intersection(this.curr.nameSet, this.prev.nameSet)
        for (const addr of commonNodes) {
            const prevNode = this.prev.nodeMap[addr]
            const currNode = this.curr.nodeMap[addr]
            const keys = _.union(_.keys(prevNode), _.keys(currNode));
            const keysChanged = _.filter(keys, (key) => {
                return !_.isEqual(prevNode[key], currNode[key]);
            });
            for (const key of keysChanged) {
                const eventType = keyTypeTable[key]
                if (eventType) {
                    addEvent(eventType, currNode, prevNode, key)
                }
                // const oldV = prevNode[key]
                // const newV = currNode[key]
                // console.log(addr, key, oldV, newV)
                // addEvent(`change:${key}`, currNode, prevNode)
            }
        }

        return events
    }
}
