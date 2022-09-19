import {EventTypes} from "@/helpers/EventTypes";
import axios from "axios";

export class SoftwareVersionTracker {
    constructor(bus, checkInterval = 60 * 1000, url='/version.txt') {
        this.bus = bus
        this._timer = 0
        this._checkInterval = checkInterval
        this._url = url
        this._version = ''
    }

    get isRunning() {
        return this._timer !== 0
    }

    run() {
        if(this.isRunning) {
            return
        }
        this._tick().then()
        this._timer = setInterval(this._tick.bind(this), this._checkInterval)
    }

    stop() {
        if(!this.isRunning) {
            return
        }
        clearInterval(this._timer)
        this._timer = 0
    }

    async _tick() {
        const r = await axios.get(this._url)
        if(r.status === 200) {
            const newVersion = r.data.trim()
            if(this._version === '') {
                this._version = newVersion
                console.log(`Set current version: ${this._version}`)
            } else if(this._version !== newVersion) {
                const oldVersion = this._version
                this._version = newVersion
                this._notify(this._version, oldVersion)
            }
        } else {
            console.error(`Failed to fetch version file. Status: ${r.status}.`)
        }
    }

    _notify(newVersion, oldVersion) {
        console.info(`New software version detected: ${oldVersion} => ${newVersion}`)
        this.bus.emit(EventTypes.NewViewerVersion, {newVersion, oldVersion})
    }
}