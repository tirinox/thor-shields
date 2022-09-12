import _ from "lodash";
import {Version} from "@/helpers/data/Version";
import {SEC_PER_BLOCK} from "@/helpers/THORUtil";

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
            this.maxAgeNode = _.maxBy(_.filter(this.nodes, node => node.activeBlockHeight && node.activeBlockHeight > 0),
                node => node.activeBlockHeight)

            this.ranks = {
                bond: this._makeRanking('bond', 'desc'),
                slash: this._makeRanking('slashPoints'),
                age: this._makeRanking('activeBlockHeight'),
                award: this._makeRanking('currentAward')
            }

            this.topHeights = this.calculateTopBlockHeight(3)
            this.topVersion = this.calculateTopVersion()
        }
    }

    _makeRanking(criteria, order = 'asc') {
        const sortedArr = _.orderBy(this._nodesWithNames, [criteria], [order])
        const names = _.map(sortedArr, 'address')
        const ranks = Array.from(Array(sortedArr.length), (_, i) => i + 1)
        return Object.fromEntries(_.zip(names, ranks))
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

    get ipAddresses() {
        return _.compact(_.uniq(_.map(this.nodes, n => n.IPAddress)))
    }

    sampleRandomly(n) {
        return new NodeSet(_.sampleSize(this.nodes, n))
    }

    setStatusAll(status) {
        _.forEach(this.nodes, n => n.status = status)
    }

    bondPercentOfTotal(bond) {
        return (bond / this.totalBond * 100.0).toFixed(2)
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
        if (this.nodes.length === 0) {
            return null
        }
        let topVersion = Version.fromString(this.nodes[0].version)
        for (let i = 1; i < this.nodes.length; ++i) {
            const currentVersion = Version.fromString(this.nodes[i].version)
            if (currentVersion.greater(topVersion)) {
                topVersion = currentVersion
            }
        }
        return topVersion.toString()
    }

    estimateTimestampAtBlock(topThorHeight, no) {
        const blockDiff = topThorHeight - no
        return Date.now() - blockDiff * SEC_PER_BLOCK * 1000.0
    }
}
