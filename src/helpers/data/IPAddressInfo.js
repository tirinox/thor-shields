import axios from "axios";
import lscache from "lscache";

export class IPAddressInfo {
    constructor(j) {
        this.status = j['status']
        this.ipAddress = j['query']
        this.message = j['message']
        this.countryCode = j['countryCode']
        this.region = j['region']
        this.regionName = j['regionName']
        this.city = j['city']
        this.lat = j['lat']
        this.lon = j['lon']
        this.isp = j['isp']
        this.org = j['org']
        this.asname = j['asname']
    }
}

export class IPAddressInfoLoader {
    constructor(expireMinutes=10) {
        this.expireMinutes = expireMinutes
    }

    url(ip) {
        return `http://ip-api.com/json/${ip}?fields=status,message,countryCode,region,regionName,city,lat,lon,isp,org,asname,query`
    }

    async loadFromService(ip) {
        const r = await axios.get(this.url(ip))
        console.info(`Loaded IP info for (${ip}) => ${r.data.status}`)
        return new IPAddressInfo(r.data)
    }

    loadFromCache(ip) {
        return lscache.get('IPInfo:' + ip)
    }

    saveToCache(data) {
        if(!data || !data.ipAddress) {
            console.warn('no data to save!')
            return
        }
        const ip = data.ipAddress
        lscache.set('IPInfo:' + ip, data, this.expireMinutes)
    }

    async load(ip) {
        let data = this.loadFromCache(ip)
        if(data) {
            return data
        }
        data = await this.loadFromService(ip)
        this.saveToCache(data)
        return data
    }
}
