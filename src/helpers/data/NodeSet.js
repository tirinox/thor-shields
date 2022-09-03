import _ from "lodash";
import {Version} from "@/helpers/data/Version";

export class NodeSet {
    constructor(nodes, calculate = true) {
        this.nodes = nodes || []

        this.total = this.nodes.length

        if (calculate) {
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

            this.topHeights = this.calculateTopBlockHeight(3)
            this.topVersion = this.calculateTopVersion()
        }
    }

    _makeRanking(criteria) {
        const sortedArr = _.sortBy(this._nodesWithNames, criteria)
        const names = _.map(sortedArr, 'address')
        const ranks = Array.from(Array(sortedArr.length), (_, i) => i + 1)
        return new Map(_.zip(names, ranks))
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

    get length() {
        return this.total
    }

    _calculateTopBlockOneChain(nMin, heights) {
        const heightSorted = _.map(Object.keys(heights), h => parseInt(h))
        heightSorted.sort().reverse()
        for (const height of heightSorted) {
            const occurrences = heights[height]
            if (occurrences >= nMin) {
                return height
            }
        }
        return null
    }

    calculateTopBlockHeight(nMin = 2) {
        const allChains = Array.from(new Set(_.flatten(_.map(this._nodesWithNames, n => _.keys(n.observeChains)))))
        const counters = _.map(
            allChains, chain => _.countBy(this._nodesWithNames, n => n.observeChains[chain] ?? 0)
        )

        return _.zipObject(
            allChains,
            _.map(allChains, (chain, i) => this._calculateTopBlockOneChain(nMin, counters[i]))
        )
    }

    calculateTopVersion() {
        if(this.nodes.length === 0) {
            return null
        }
        let topVersion = Version.fromString(this.nodes[0].version)
        for(let i = 1; i < this.nodes.length; ++i) {
            const currentVersion = Version.fromString(this.nodes[i].version)
            if(currentVersion.greater(topVersion)) {
                topVersion = currentVersion
            }
        }
        return topVersion
    }
}
