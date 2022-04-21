import {Vector3} from "three";
import {Util} from "@/helpers/MathUtil";

export class PhysicalObject {
    constructor() {
        this.mass = 1.0
        this.force = new Vector3()
        this.velocity = new Vector3()
        this.friction = 0.0
        this.o = null
    }

    update(dt) {
        const acceleration = this.force.multiplyScalar(this.mass)
        this.velocity.copy(this.velocity.clone().add(acceleration.multiplyScalar(dt)))
        this.velocity.multiplyScalar(Util.clamp(1.0 - this.friction, 0.0, 1.0))
        this.realObject.position.copy(this.o.position.clone().add(this.velocity.clone().multiplyScalar(dt)))
    }

    nullifyForce() {
        this.force.set(0.0, 0.0, 0.0)
    }

    get realObject() {
        return this.o
    }

    get radius() {
        return 1.0
    }

    repel(physObj, forceMult = 100.0) {
        if (physObj === this) {
            return
        }

        const thisPos = this.realObject.position
        const otherPos = physObj.realObject.position

        const d = thisPos.distanceTo(otherPos)
        const minDistance = this.radius + physObj.radius
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
}