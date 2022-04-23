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
        const objPosition = physObj.realObject.position
        const magnitude = this.constCoeff + distance * this.linearCoeff + distance * distance * this.quadraticCoeff
        physObj.force.add(toPosition.clone().sub(objPosition).normalize().multiplyScalar(magnitude))
    }

    applyForce(physObj) {
        const objPosition = physObj.realObject.position
        const distance = this.position.distanceTo(objPosition)
        const infiniteRadius = this.radius <= 0.0
        if ((infiniteRadius || distance <= this.radius) && distance > this.relaxRadius) {
            this.applyForceToDistance(physObj, distance, this.position)
        }
    }
}