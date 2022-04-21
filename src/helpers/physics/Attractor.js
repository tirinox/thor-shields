export class Attractor {
    constructor(position, constCoeff = 0, lineralCoeff = 0, quadraticCoeff = 0, radius = -1.0) {
        this.position = position
        this.constCoeff = constCoeff
        this.lineralCoeff = lineralCoeff
        this.quadraticCoeff = quadraticCoeff
        this.radius = radius
    }

    applyForce(physObj) {
        const objPosition = physObj.realObject.position
        const distance = this.position.distanceTo(objPosition)
        const infiniteRadius = this.radius <= 0.0
        if(infiniteRadius || distance <= this.radius) {
            const magnitude = this.constCoeff + distance * this.lineralCoeff + distance * distance * this.quadraticCoeff
            physObj.force.add(this.position.clone().sub(objPosition).normalize().multiplyScalar(magnitude))
        }
    }
}