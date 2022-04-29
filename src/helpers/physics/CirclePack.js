import * as THREE from "three";
import {PhysicalObject} from "@/helpers/physics/PhysicalObject";
import {Attractor} from "@/helpers/physics/Attractor";
import {Simulation} from "@/helpers/physics/Simulation";
import _ from "lodash";


class VirtualObject extends PhysicalObject {
    constructor(x, y, r, name, attractor, friction) {
        super();
        this.name = name
        this.position = new THREE.Vector3(x, y, 0)
        this._radius = r
        this.attractors = [attractor]
        this.friction = friction
    }

    get radius() {
        return this._radius
    }
}

export class CirclePack {
    constructor(force, boundRadius, repelForce = 600, friction = 0.02, iterSteps = 1) {
        this.force = force
        this.boundRadius = boundRadius
        this.iterSteps = iterSteps
        this.dt = 0.05
        this.simulation = new Simulation()
        this.simulation.repelForce = repelForce
        this.friction = friction

        this.metaAttractor = new Attractor(new THREE.Vector3(),
            this.force, 0, 0, -1, 0)
    }

    addCircle(name, radius) {
        this.simulation.addObject(
            name,
            new VirtualObject(
                0,
                0,
                radius,
                name,
                this.metaAttractor,
                this.friction,
            )
        )
    }

    arrangeAroundCenter() {
        if (!this.simulation.size) {
            return this
        }

        const deltaAngle = Math.PI * 2 / this.simulation.size
        const r = this.boundRadius * 0.5 * 0.8
        let angle = Math.PI * 0.5

        for (const name of _.keys(this.simulation.objects)) {
            const obj = this.simulation.getByName(name)
            if (obj) {
                obj.position.x = r * Math.cos(angle)
                obj.position.y = r * Math.sin(angle)
            }

            angle -= deltaAngle
        }
        return this
    }

    clear() {
        this.simulation.dispose()
    }

    pack(dt, steps) {
        if (!this.simulation.size) {
            return this
        }
        dt = dt || this.dt
        steps = steps || this.iterSteps
        this.simulation.doNSteps(steps, dt)
        return this
    }

    getResults() {
        const results = {}
        for (const [name, obj] of _.entries(this.simulation.objects)) {
            results[name] = {
                position: obj.position,
                radius: obj.radius
            }
        }
        return results
    }
}