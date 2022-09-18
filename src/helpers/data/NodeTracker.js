import _ from "lodash";
import {NodeEvent} from "@/helpers/NodeEvent";
import {Random} from "@/helpers/MathUtil";
import {Version} from "@/helpers/data/Version";
import {NodeStatus} from "@/helpers/data/NodeInfo";

export class NodeTracker {
    constructor(prevNodeSet, currNodeSet) {
        this.prev = prevNodeSet
        this.curr = currNodeSet
    }

    extractEvents() {
        const events = []
        const addEvent = (t, node, prevNode, k) => {
            k = k || 'address'
            events.push(new NodeEvent(t, node, prevNode, node ? node[k] : '',
                prevNode ? prevNode[k] : '', this.curr))
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

export class DebugNodeJuggler {
    constructor(period = 10) {
        this.tick = 1
        this.period = period
        this.enabled = true
        this.juggleStatus = true
        this.juggleVersion = true

        this.memorizeVersions = {}
    }

    handleNodes(nodes) {
        if (this.enabled) {
            if (this.tick % this.period === 0) {
                nodes = this._juggleNodes(nodes)
            }
            this.tick++
        }
        return nodes
    }

    _juggleNodes(nodes) {
        if(this.juggleStatus) {
            nodes = this._juggleNodesStatus(nodes)
        }
        if(this.juggleVersion) {
            nodes = this._juggleNodesVersion(nodes)
        }
        return nodes
    }

    _juggleNodesStatus(nodes) {
        const nodesIn = Random.getRandomIntRange(2, 7)
        const nodesOut = Random.getRandomIntRange(2, 7)

        console.warn(`Attention! _juggleNodes: IN: ${nodesIn}, OUT: ${nodesOut}!`)

        nodes.filteredByStatus(NodeStatus.Active).sampleRandomly(nodesOut).setStatusAll(NodeStatus.Standby)
        nodes.filteredByStatus(NodeStatus.Standby).sampleRandomly(nodesIn).setStatusAll(NodeStatus.Active)

        return nodes
    }

    _nextVersion(vString) {
        return Version.fromString(vString).inc(10, 100).toString()
    }

    _juggleNodesVersion(nodes) {
        const nUpgrade = 1

        const that = this
        _.each(nodes.nodes, node => {
            const v = that.memorizeVersions[node.address]
            if(v) {
                node.version = v
            }
        })

        nodes.sampleRandomly(nUpgrade).nodes.forEach(node => {
            const oldVersion = node.version
            node.version = this._nextVersion(node.version)
            that.memorizeVersions[node.address] = node.version
            console.warn(`Debug upgrade ${node.shortAddress}: ${oldVersion} => ${node.version}`)
        })

        return nodes
    }
}
