import {distanceXY} from "@/helpers/3D";

export class Attractor {
    constructor(position,
                constCoeff = 0, linearCoeff = 0, quadraticCoeff = 0,
                radius = -1.0,
                relaxRadius = 0.0) {
        this.position = position
        this.constCoeff = constCoeff
        this.linearCoeff = linearCoeff
        this.quadraticCoeff = quadraticCoeff
        this.radius = radius
        this.relaxRadius = relaxRadius
    }

    applyForceToDistance(physObj, distance, toPosition) {
        const fromPosition = physObj.realObject.position
        const f = this.getForce(distance, fromPosition, toPosition)
        physObj.force.add(f)
    }

    getForce(distance, fromPosition, toPosition) {
        const magnitude = this.constCoeff + distance * this.linearCoeff + distance * distance * this.quadraticCoeff
        return toPosition.clone().sub(fromPosition).normalize().multiplyScalar(magnitude)
    }

    distance(physObj) {
        const objPosition = physObj.realObject.position
        return this.position.distanceTo(objPosition)
    }

    applyForce(physObj) {
        const distance = this.distance(physObj)
        const infiniteRadius = this.radius <= 0.0

        if ((infiniteRadius || distance <= this.radius) && distance > this.relaxRadius) {
            this.applyForceToDistance(physObj, distance, this.position)
        }
    }
}

export class AttractorFlat extends Attractor {
    distance(physObj) {
        return distanceXY(this.position, physObj.realObject.pos)
    }

    getForce(distance, fromPosition, toPosition) {
        let f = super.getForce(distance, fromPosition, toPosition);
        f.z = (fromPosition.z - toPosition.z) * 0.1
        return f
    }
}