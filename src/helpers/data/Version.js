import _ from "lodash";

function isGarbage(x) {
    return x === undefined || x === null || isNaN(x)
}

export class Version {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    static fromString(v) {
        if (v instanceof Version) {
            return v
        }
        const components = _.map(v.split('.'), x => parseInt(x))
        const n = components.length
        const x = components[0]
        const y = n > 1 ? components[1] : 0
        const z = n > 2 ? components[2] : 0
        return new Version(x, y, z)
    }

    get isInvalid() {
        return isGarbage(this.x) || isGarbage(this.y) || isGarbage(this.z)
    }

    greater(v2) {
        if(this.x > v2.x) {
            return true;
        } else if(this.x === v2.x) {
            if(this.y > v2.y) {
                return true;
            } else if(this.y === v2.y) {
                return this.z > v2.z;
            }
        }
    }

    less(v2) {
        if(this.x < v2.x) {
            return true;
        } else if(this.x === v2.x) {
            if(this.y < v2.y) {
                return true;
            } else if(this.y === v2.y) {
                return this.z < v2.z;
            }
        }
    }

    equal(v2) {
        return this.x === v2.x && this.y === v2.y && this.z === v2.z
    }

    toString() {
        return `${this.x}.${this.y}.${this.z}`
    }

    inc(xLimit = 10, yLimit = 10) {
        this.z++
        if (this.z >= xLimit) {
            this.z = 0
            this.y++
            if (this.y >= yLimit) {
                this.x++
                this.y = 0
            }
        }
        return this
    }

    get asInt() {
        return this.z + 1000 * this.y + 1000000 * this.x
    }

    static loadVersions(rawVersions) {
        return _.map(rawVersions, v => Version.fromString(v))
    }

    static maximumVersion(versions) {
        return _.maxBy(Version.loadVersions(versions), v => v.asInt)
    }

    static minimumVersion(versions) {
        return _.minBy(Version.loadVersions(versions), v => v.asInt)
    }

    static getVersionSet(nodeObjects, path = 'node.version') {
        return Version.loadVersions(_.uniq(_.map(nodeObjects, path)))
    }

    static getSemanticVersionsDistribution(nodeObjects, path = 'node.version', activePath = 'node.isActive') {
        const activeNodes = _.filter(nodeObjects, no => _.get(no, activePath))

        const activeVersions = Version.getVersionSet(activeNodes, path)
        const maxActiveVersion = Version.maximumVersion(activeVersions)
        const minActiveVersion = Version.minimumVersion(activeVersions)
        const otherActiveVersions = _.differenceBy(activeVersions, _.compact([maxActiveVersion, minActiveVersion]),
            v => v.asInt)
        const otherActiveVersionsStr = _.map(otherActiveVersions, v => v.toString())

        const results = {}

        for (const nodeObject of nodeObjects) {
            const versionStr = _.get(nodeObject, path)
            const version = Version.fromString(versionStr)
            let target = null
            let comment = ''
            const isActive = version.equal(minActiveVersion)
            const isLatest = version.equal(maxActiveVersion)
            if(isLatest && isActive) {
                target = minActiveVersion.toString()
                comment = 'latest and active'
            } else if (isLatest) {
                target = maxActiveVersion.toString()
                comment = 'latest'
            } else if (isActive) {
                target = minActiveVersion.toString()
                comment = 'active'
            } else if (_.includes(otherActiveVersionsStr, versionStr)) {
                target = versionStr
                comment = 'interim'
            } else if (!versionStr || versionStr === '0.0.0') {
                target = 'unknown'
            } else {
                target = `${version.x}.X.X`
                comment = 'old'
            }

            if (!results[target]) {
                results[target] = {
                    objects: [],
                    comment,
                    mostPopular: false,
                    isActive: nodeObject.node.isActive
                }
            }
            results[target].objects.push(nodeObject)
        }

        if(!_.isEmpty(results)) {
            const maxVersion = _.maxBy(_.values(results), v => v.objects.length)
            maxVersion.mostPopular = true
        }

        return results
    }
}
