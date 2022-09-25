import axios from "axios";
import {NodeSet} from "@/helpers/data/NodeSet";
import {NodeInfo} from "@/helpers/data/NodeInfo";
import _ from "lodash";
import {IPAddressInfoLoader} from "@/helpers/data/IPAddressInfo";


export class URLDataSource {
    constructor(baseUrl, period) {
        this.period = period
        this.baseUrl = baseUrl
        this._isRunning = false
        this._timer = 0
        this.callback = () => 0
        this.ipAddressLoader = new IPAddressInfoLoader()
    }

    run() {
        if (this._isRunning) {
            console.warn(`${this.toString()} is already running`)
            return
        }
        this._isRunning = true

        console.info(`${this.toString()} started!`)

        this._tick().then()

        this._timer = setInterval(() => {
            this._tick().then()
        }, this.period)
    }

    stop() {
        if (this._isRunning) {
            clearInterval(this._timer)
            this._timer = 0
            this._isRunning = false
            console.info(`${this.toString()} stopped.`)
        }
    }

    toString() {
        return `URLDataSource(${this.baseUrl}, ${this.period / 1000.} sec)`
    }

    get isRunning() {
        return this._isRunning
    }

    async dataProcess(rawData) {
        return rawData
    }

    get url() {
        return this.baseUrl
    }

    async _load() {
        return await axios.get(this.url, {
            headers: {
                'Content-type': 'application/json'
            }
        })
    }

    async loadOnce() {
        return await this.dataProcess(
            await this._load()
        )
    }

    async _tick() {
        try {
            const data = await this._load()
            if (this.callback) {
                const result = await this.dataProcess(data.data)
                this.callback(result)
            }
        } catch (e) {
            console.error(`${this.toString()} tick failed: ${e}`)
            throw e
        }
    }
}

export class NodeDataSource extends URLDataSource {
    get url() {
        return this.baseUrl + '/thorchain/nodes'
    }

    async dataProcess(rawData) {
        const nodeSet = new NodeSet(
            _.map(rawData, json => new NodeInfo(json))
        )

        let ipInfoDic = {}
        try {
            ipInfoDic = await this.ipAddressLoader.loadBunch(nodeSet.ipAddresses)
        } catch (e) {
            console.error(`failed to load IPInfo`)
        }

        for (const node of nodeSet.nodes) {
            if (node.IPAddress) {
                node.IPInfo = ipInfoDic[node.IPAddress]
            }
        }
        return nodeSet
    }
}

export class LastBlockDataSource extends URLDataSource {
    get url() {
        return this.baseUrl + '/thorchain/lastblock'
    }

    async dataProcess(rawData) {
        const chainHeights = {}
        for (const chainItem of rawData) {
            chainHeights['THOR'] = +chainItem['thorchain']
            chainHeights[chainItem['chain']] = +chainItem['last_observed_in']
        }
        return chainHeights
    }
}

export class NetworkDataSource extends URLDataSource {
    get url() {
        return this.baseUrl + '/v2/network';
    }

    async dataProcess(rawData) {
        return {
            nextChurnHeight: +rawData['nextChurnHeight'],
        }
    }
}
