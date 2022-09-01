import _ from "lodash";

export class NodeSet {
    constructor(nodes, calculate=true) {
        this.nodes = nodes || []

        this.total = this.nodes.length

        if(calculate) {
            this._nodesWithNames = _.filter(this.nodes, (item) => item.address)
            this.byAddress = _.keyBy(this._nodesWithNames, 'address')
            this.nameSet = _.keys(this.byAddress)

            this.totalBond = _.sumBy(this.nodes, (node) => node.bond)
            this.maxSlashNode = _.maxBy(this.nodes, (node) => node.slashPoints)
            this.trampCount = this.total - this._nodesWithNames.length
            this.maxAgeNode = _.maxBy(this.nodes, (node) => node.ageSeconds)

            this.ranks = {
                bond: this._makeRanking('bond'),
                slash: this._makeRanking('slashPoints'),
                age: this._makeRanking('ageSeconds'),
                award: this._makeRanking('currentAward')
            }
        }
    }

    _makeRanking(criteria) {
        const sortedArr = _.sortBy(this._nodesWithNames, criteria)
        const ranks = [...Array(sortedArr.length).keys()]
        return new Map(_.zip(ranks, ranks))
    }

    findByAddress(address) {
        return this.byAddress[address]
    }

    sortedNodes(attribute, asc = true) {
        const f = asc ? 1 : -1
        return new NodeSet(_.sortBy(this.nodes, (node) => f * node[attribute]))
    }

    filteredByStatus(status) {
        return new NodeSet(_.filter(this.nodes, (node) => node.status === status))
    }

    get sortedByBond() {
        return this.sortedNodes('bond')
    }

    get sortedByAge() {
        return this.sortedNodes('statusSince')
    }

    sampleRandomly(n) {
        return new NodeSet(_.sampleSize(this.nodes, n))
    }

    setStatusAll(status) {
        _.forEach(this.nodes, n => n.status = status)
    }

    bondPercentOfTotal(bond) {
        return Math.round(bond / this.totalBond * 10000.0) * 0.01
    }
}
