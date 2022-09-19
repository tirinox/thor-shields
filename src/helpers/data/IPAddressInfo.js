import axios from "axios";
import lscache from "lscache";
import _ from "lodash";


export class IPAddressInfo {
    constructor(j) {
        this.ipAddress = j['ip']
        this.countryCode = j['country_code']
        this.country = j['country_name']
        this.city = j['city']
        this.latitude = j['latitude']
        this.longitude = j['longitude']
        this.providerName = j['org']
        this.flag = IPAddressInfo.getFlagEmoji(this.countryCode)
    }

    static getFlagEmoji(countryCode) {
        if (countryCode) {
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

    async loadFromService(ips) {
        const r = await axios.get(this.url(ips.join(',')))
        console.info(`Loaded IP info for (${ips}) => ${r.status}`)
        return _.mapValues(r.data, j => new IPAddressInfo(j))
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

    async loadBunch(ipAddresses) {
        const results = {}
        const requestList = []
        _.each(ipAddresses, ip => {
            const data = this.loadFromCache(ip)
            if (data) {
                results[ip] = data
            } else {
                requestList.push(ip)
            }
        })

        // console.log(`requestList = ${requestList.length}, cached = ${_.keys(results).length}`)

        const addressChunks = _.chunk(requestList, 50)
        for(const ipListChunk of addressChunks) {
            const chunkInfoDic = await this.loadFromService(ipListChunk)
            _.each(_.values(chunkInfoDic), d => this.saveToCache(d))
            _.extend(results, chunkInfoDic)
        }

        return results
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
