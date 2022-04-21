export class Attractor {
    constructor(position, constCoeff = 0, lineralCoeff = 0, quadraticCoeff = 0) {
        this.position = position
        this.constCoeff = constCoeff
        this.lineralCoeff = lineralCoeff
        this.quadraticCoeff = quadraticCoeff
    }

    applyForce(physObj) {
        const objPosition = physObj.realObject.position
        const distance = (this.lineralCoeff !== 0.0 || this.quadraticCoeff !== 0.0) ?
            this.position.distanceTo(objPosition) : 0.0
        const magnitude = this.constCoeff + distance * this.lineralCoeff + distance * distance * this.quadraticCoeff
        physObj.force.add(this.position.clone().sub(objPosition).normalize().multiplyScalar(magnitude))
    }
}