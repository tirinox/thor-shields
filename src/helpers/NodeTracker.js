import _ from "lodash";
import {NodeEvent} from "@/helpers/NodeEvent";

export class NodeTracker {
    constructor(prevNodeList, currNodeList) {
        this.prev = NodeTracker.prepareNodeList(prevNodeList)
        this.curr = NodeTracker.prepareNodeList(currNodeList)
    }

    static prepareNodeList(nodeList) {
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
                prevNode ? prevNode[k]: ''))
        }

        const addedNodeAddresses = _.difference(this.curr.nameSet, this.prev.nameSet)
        for(const addr of addedNodeAddresses) {
            addEvent(NodeEvent.EVENT_TYPE.CREATE, this.curr.nodeMap[addr], null)
        }

        const removeNodeAddresses = _.difference(this.prev.nameSet, this.curr.nameSet)
        for(const addr of removeNodeAddresses) {
            addEvent(NodeEvent.EVENT_TYPE.DESTROY, null, this.prev.nodeMap[addr])
        }

        const commonNodes = _.intersection(this.curr.nameSet, this.prev.nameSet)
        for(const addr of commonNodes) {
            const prevNode = this.prev.nodeMap[addr]
            const currNode = this.curr.nodeMap[addr]
            const keys =  _.union(_.keys(prevNode), _.keys(currNode));
            const keysChanged = _.filter(keys, (key) => {
                return prevNode[key] !== currNode[key];
            });
            for(const key of keysChanged) {
                let eventType = ''
                if(key === 'slash_points') {
                    eventType = NodeEvent.EVENT_TYPE.SLASH
                } else if(key === 'bond') {
                    eventType = NodeEvent.EVENT_TYPE.BOND_CHANGE
                } else {
                    continue
                }
                // todo: more events
                addEvent(eventType, currNode, prevNode, key)
                // const oldV = prevNode[key]
                // const newV = currNode[key]
                // console.log(addr, key, oldV, newV)
                // addEvent(`change:${key}`, currNode, prevNode)
            }
        }

        return events
    }
}