import {Vector3} from "three";
import _ from "lodash";
import numbro from 'numbro';

export function defaultValue(x, defaultValue) {
    return x === undefined ? defaultValue : x
}

export function dec2hex(dec) {
    return dec.toString(16).padStart(2, "0")
}

export class Random {
    static getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    static getRandomFloat(min, max) {
        return Math.random() * (max - min) + min
    }

    static getRandomSample(array) {
        if (!array) {
            return null
        }
        const index = Random.getRandomInt(array.length)
        return array[index]
    }

    static removeRandomItem(array) {
        if (Math.random() > 0.5) {
            const index = Random.getRandomInt(array.length)
            array.splice(index, 1)
        }
        return array
    }

    static randomVector({xMin, xMax, yMin, yMax, zMin, zMax}) {
        xMin = defaultValue(+xMin, -10)
        xMax = defaultValue(+xMax, 10)
        yMin = defaultValue(+yMin, -10)
        yMax = defaultValue(+yMax, 10)
        zMin = defaultValue(+zMin, -10)
        zMax = defaultValue(+zMax, 10)

        return new Vector3(
            Random.getRandomFloat(xMin, xMax),
            Random.getRandomFloat(yMin, yMax),
            Random.getRandomFloat(zMin, zMax),
        )
    }

    static randomOnCircle(r = 100, cx = 0, cy = 0) {
        const phase = Random.getRandomFloat(0, 2 * Math.PI)
        return new Vector3(
            cx + r * Math.cos(phase),
            cy + r * Math.sin(phase)
        )
    }

    static getRandomIntRange(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;  // [min, max)
    }

    // generateId :: Integer -> String
    static generateId(len) {
        const arr = new Uint8Array((len || 20) / 2)
        window.crypto.getRandomValues(arr)
        return Array.from(arr, dec2hex).join('')
    }
}

export class Section {
    constructor(p1, p2) {
        this.p1 = p1
        this.p2 = p2
    }

    get dx() {
        return this.p2.x - this.p1.x
    }

    get dy() {
        return this.p2.y - this.p1.y
    }

    whichSide(x, y) {
        const A = x - this.p1.x;
        const B = y - this.p1.y;
        const C = this.dx;
        const D = this.dy;
        return Math.sign(A * C - B * D);
    }

    get center() {
        return {
            x: 0.5 * (this.p1.x + this.p2.x),
            y: 0.5 * (this.p1.y + this.p2.y)
        }
    }

    nearestPoint(x, y) {
        const A = x - this.p1.x;
        const B = y - this.p1.y;
        const C = this.dx;
        const D = this.dy;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) {
            param = dot / len_sq;
        }

        if (param < 0) {
            x = this.p1.x
            y = this.p1.y
        } else if (param > 1) {
            x = this.p2.x
            y = this.p2.y
        } else {
            x = this.p1.x + param * C;
            y = this.p1.y + param * D;
        }
        return {x, y}
    }

    pDistance(xo, yo) {
        const nearestPoint1 = this.nearestPoint(xo, yo)
        return new Section(nearestPoint1, {x: xo, y: yo}).length
    }

    get length() {
        const dx = this.dx
        const dy = this.dy
        return Math.sqrt(dx * dx + dy * dy)
    }
}

export class Util {
    static clamp(x, xMin, xMax) {
        return Math.min(+xMax, Math.max(+xMin, +x))
    }

    static centerOf(group) {
        if (!group || !group.length) {
            return
        }
        let sumX = _.sumBy(group, item => item.x)
        let sumY = _.sumBy(group, item => item.y)
        return {
            x: sumX / group.length,
            y: sumY / group.length
        }
    }

    static _signHelper(p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    }

    static pointInTriangle(pt, threePts) {
        const [v1, v2, v3] = threePts
        const d1 = Util._signHelper(pt, v1, v2);
        const d2 = Util._signHelper(pt, v2, v3);
        const d3 = Util._signHelper(pt, v3, v1);

        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        return !(hasNeg && hasPos);
    }
}

export function shortNumber(x, mantissa = 2, postFix = '') {
    return numbro(x).format({
        average: true,
        mantissa,
    }) + postFix
}

export function fullNumber(x, postFix) {
    return numbro(x).format({
        thousandSeparated: true
    }) + postFix
}

export const RUNE = 'Rune'

export function shortRune(x, mantissa = 2) {
    return shortNumber(x, mantissa, ' ' + RUNE)
}

export function fullRune(x) {
    return fullNumber(x, ' ' + RUNE)
}
