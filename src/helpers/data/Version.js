import _, {isString} from "lodash";

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
        return this.x > v2.x || this.y > v2.y || this.z > v2.z
    }

    less(v2) {
        return this.x < v2.x || this.y < v2.y || this.z < v2.z
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
}
