import axios from "axios";

export class URLDataSource {
    constructor(url, period) {
        this.period = period
        this.url = url
        this._isRunning = false
        this._timer = 0
        this.callback = () => 0
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
        }, this.period * 1000)
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
                this.callback(data.data)
            }
        } catch (e) {
            console.error(`${this.toString()} tick failed: ${e}`)
        }
    }
}