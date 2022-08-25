import {distanceXY} from "@/helpers/3D";
// import * as THREE from "three";

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

Attractor.INFINITE = -1

export class AttractorFlat extends Attractor {
    distance(physObj) {
        return distanceXY(this.position, physObj.realObject.position)
    }

    applyForce(physObj) {
        super.applyForce(physObj);
        this.squishZ(physObj)
    }

    squishZ(phyObj) {
        const zDist = phyObj.realObject.position.z - this.position.z
        let fZ = 0.0
        if(Math.abs(zDist) > 1.0) {
            fZ = -zDist * 100.0
        }
        phyObj.force.z = fZ
    }
}