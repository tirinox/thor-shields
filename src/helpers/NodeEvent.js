const EVENT_TYPE = {
    CREATE: 'create',
    DESTROY: 'destroy',

    SLASH: 'slash',
    IP_ADDRESS: 'ip_address',
    STATUS: 'status',
    VERSION: 'version',
    FORCED_LEAVE: 'forced_to_leave',
    REQUESTED_LEAVE: 'requested_to_leave',
    AWARD: 'current_award',
    BOND_CHANGE: 'bond',
    OBSERVE_CHAIN: 'observe_chains',
    ACTIVE_BLOCK_HEIGHT: 'active_block_height',
}

export class NodeEvent {
    constructor(type, node, prevNode, currValue, prevValue) {
        this.type = type
        this.node = node
        this.prevNode = prevNode
        this.currValue = currValue
        this.prevValue = prevValue
        this.isTramp = node ? node.node_address === '' : false
    }

    toString() {
        const addr = this.node ? this.node.node_address : '?'
        return `NodeEvent(${this.type}, ${addr}, ${this.currValue} => ${this.prevValue})`
    }
}

NodeEvent.EVENT_TYPE = EVENT_TYPE
