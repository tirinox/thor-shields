import axios from "axios";
import {NodeSet} from "@/helpers/data/NodeSet";
import {NodeInfo} from "@/helpers/data/NodeInfo";
import _ from "lodash";
import {IPAddressInfoLoader} from "@/helpers/data/IPAddressInfo";


export class URLDataSource {
    constructor(url, period) {
        this.period = period
        this.url = url
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
        return `URLDataSource(${this.url}, ${this.period} sec)`
    }

    get isRunning() {
        return this._isRunning
    }

    async _tick() {
        try {
            const data = await axios.get(this.url, {
                headers: {
                    'Content-type': 'application/json'
                }
            })
            if (this.callback) {
                const rawData = data.data
                const nodeSet = new NodeSet(
                    _.map(rawData, json => new NodeInfo(json))
                )

                for(const node of nodeSet.nodes) {
                    if(node.IPAddress) {
                        try {
                            node.IPInfo = await this.ipAddressLoader.load(node.IPAddress)
                        } catch (e) {
                            console.error(`failed to load IPInfo for ${node.IPAddress}`)
                        }
                    }
                }

                this.callback(nodeSet)
            }
        } catch (e) {
            console.error(`${this.toString()} tick failed: ${e}`)
            throw e
        }
    }
}
