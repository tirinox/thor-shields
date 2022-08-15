import {Vector3} from "three";
import {Util} from "@/helpers/MathUtil";
import {Config} from "@/config";

export class PhysicalObject {
    constructor() {
        this.mass = 1.0
        this.force = new Vector3()
        this.velocity = new Vector3()
        this.friction = 0.0
        this.attractors = []
    }

    update(dt) {
        if(this.attractors.forEach) {
            this.attractors.forEach(attr => attr.applyForce(this))
        }

        const acceleration = this.force.multiplyScalar(this.mass)
        this.velocity.copy(this.velocity.clone().add(acceleration.multiplyScalar(dt)))
        this.velocity.multiplyScalar(Util.clamp(1.0 - this.friction, 0.0, 1.0))
        if(this.velocity.lengthSq() > Config.Physics.MaxSpeedSq) {
            this.velocity.setLength(Math.sqrt(Config.Physics.MaxSpeedSq))
        }
        this.realObject.position.add(this.velocity.clone().multiplyScalar(dt))
    }

    nullifyForce() {
        this.force.set(0.0, 0.0, 0.0)
    }

    get radius() {
        return 1.0
    }

    applyForceTo(direction, force) {
        this.force.add(direction.copy().multiplyScalar(force))
    }

    get realObject() {
        return this
    }

    repel(physObj, forceMult = 100.0) {
        if (physObj === this) {
            return
        }

        const thisPos = this.realObject.position
        const otherPos = physObj.realObject.position

        const d = thisPos.distanceTo(otherPos)
        const minDistance = (this.radius + physObj.radius)
        if (d < minDistance) {
            const lineDir = thisPos
                .clone()
                .sub(otherPos)
                .normalize()
                .multiplyScalar(forceMult)
            this.force.add(lineDir)
            physObj.force.add(lineDir.negate())
        }
    }

    get boundingBox() {
        const x = this.realObject.position.x
        const y = this.realObject.position.y
        const r = this.radius
        return {
            minX: x - r,
            minY: y - r,
            maxX: x + r,
            maxY: y + r,
        }
    }
}