import axios from "axios";
import lscache from "lscache";


export class IPAddressInfo {
    constructor(j) {
        this.ipAddress = j['ip']
        this.countryCode = j['country_code']
        this.country = j['country']
        this.latitude = j['latitude']
        this.longitude = j['longitude']
        this.providerName = j['org']
        this.flag = IPAddressInfo.getFlagEmoji(this.countryCode)
    }

    static getFlagEmoji(countryCode) {
        if(countryCode) {
            const codePoints = countryCode
                .toUpperCase()
                .split('')
                .map(char => 127397 + char.charCodeAt());
            return String.fromCodePoint(...codePoints);
        } else {
            return ''
        }
    }
}


export const UNKNOWN = 'UNKNOWN'


export class IPAddressInfoLoader {
    constructor(expireMinutes = 24 * 60) {
        this.expireMinutes = expireMinutes
        this._key = 'IPInfo2'
    }

    url(ip) {
        return `https://settings.thornode.org/api/node/ip/${ip}`
    }

    async loadFromService(ip) {
        const r = await axios.get(this.url(ip))
        console.info(`Loaded IP info for (${ip}) => ${r.status}`)
        return new IPAddressInfo(r.data)
    }

    loadFromCache(ip) {
        return lscache.get(`${this._key}:${ip}`)
    }

    saveToCache(data) {
        if (!data || !data.ipAddress) {
            console.warn('no data to save!')
            return
        }
        const ip = data.ipAddress
        lscache.set(`${this._key}:${ip}`, data, this.expireMinutes)
    }

    async load(ip) {
        let data = this.loadFromCache(ip)
        if (data) {
            return data
        }
        data = await this.loadFromService(ip)
        this.saveToCache(data)
        return data
    }

    static refineProviderName(name) {
        if (name === undefined) {
            return UNKNOWN
        }

        name = name.toUpperCase()
        name = name.replace('ONLINE GMBH', '')
        for (const component of name.split('-')) {
            if (component !== 'AS') {
                return component
            }
        }

        return name
    }
}
