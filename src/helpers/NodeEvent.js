const EVENT_TYPE = {
    CREATE: 'create',
    SLASH: 'slash',
    BOND_CHANGE: 'bond_change',
    DESTROY: 'destroy'
}

export class NodeEvent {
    constructor(type, node, prevNode, currValue, prevValue) {
        this.type = type
        this.node = node
        this.prevNode = prevNode
        this.currValue = currValue
        this.prevValue = prevValue
        this.isTramp = node.node_address === ''
    }

    toString() {
        const addr = this.node ?? this.node.node_address
        return `NodeEvent(${this.type}, ${addr}. ${this.currValue} => ${this.prevValue})`
    }
}

NodeEvent.EVENT_TYPE = EVENT_TYPE

