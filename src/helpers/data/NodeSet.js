import _ from "lodash";

export class NodeSet {
    constructor(nodes) {
        this.nodes = nodes

        this.total = this.nodes.length

        this._nodesWithNames = _.filter(this.nodes, (item) => item.address)
        this.byAddress = _.keyBy(this._nodesWithNames, 'address')
        this.nameSet = _.keys(this.byAddress)

        this.totalBond = _.sumBy(this.nodes, (node) => node.bond)
        this.maxSlashNode = _.maxBy(this.nodes, (node) => node.slashPoints)
        this.trampCount = this.total - this._nodesWithNames.length
        this.maxAgeNode = _.maxBy(this.nodes, (node) => node.ageSeconds)
    }

    findByAddress(address) {
        return this.byAddress[address]
    }

    sortedNodes(attribute, asc = true) {
        const f = asc ? 1 : -1
        return new NodeSet(_.sortBy(this.nodes, (node) => f * node[attribute]))
    }

    filteredByStatus(status) {
        return new NodeSet(_.filter(this.nodes), (node) => node.status === status)
    }

    get sortedByBond() {
        return this.sortedNodes('bond')
    }

    get sortedByAge() {
        return this.sortedNodes('statusSince')
    }
}
