import {Vector3} from "three";

export function defaultValue(x, defaultValue) {
    return x === undefined ? defaultValue : x
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
        xMin = defaultValue(xMin, -10)
        xMax = defaultValue(xMax, 10)
        yMin = defaultValue(yMin, -10)
        yMax = defaultValue(yMax, 10)
        zMin = defaultValue(zMin, -10)
        zMax = defaultValue(zMax, 10)

        return new Vector3(
            Random.getRandomFloat(xMin, xMax),
            Random.getRandomFloat(yMin, yMax),
            Random.getRandomFloat(zMin, zMax),
        )
    }
}

export class Util {
    static clamp(x, xMin, xMax) {
        return Math.min(+xMax, Math.max(+xMin, +x))
    }
}


