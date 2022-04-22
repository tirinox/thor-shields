import * as THREE from "three";
import {PhysicalObject} from "@/helpers/physics/PhysicalObject";
import {Attractor} from "@/helpers/physics/Attractor";
import {Simulation} from "@/helpers/physics/Simulation";
import _ from "lodash";


class VirtualObject extends PhysicalObject {
    constructor(x, y, r, name, attractor) {
        super();
        this.name = name
        this.position = new THREE.Vector3(x, y, 0)
        this._radius = r
        this.attractors = [attractor]
    }

    get radius() {
        return this._radius
    }
}

export class CirclePackMy {
    constructor(force, boundRadius, iterSteps = 1000) {
        this.force = force
        this.boundRadius = boundRadius
        this.cicles = []
        this.iterSteps = iterSteps
        this.dt = 0.05
    }

    addCircle(name, radius) {
        this.cicles.push({
            name, radius
        })
    }

    pack() {
        if (!this.cicles.length) {
            return
        }

        const deltaAngle = Math.PI * 2 / this.cicles.length
        const r = this.boundRadius * 0.5 * 0.8

        let angle = 0.0
        const attractor = new Attractor(new THREE.Vector3(), this.force, 0, 0, -1, 0)
        const simulation = new Simulation()
        for (const {name, radius} of this.cicles) {
            simulation.addObject(
                name,
                new VirtualObject(
                    r * Math.cos(angle),
                    r * Math.sin(angle),
                    radius,
                    name,
                    attractor
                )
            )
            angle += deltaAngle
        }

        simulation.doNSteps(this.iterSteps, this.dt)

        const results = {}
        for(const [name, obj] of _.entries(simulation.objects)) {
            results[name] = {
                position: obj.position,
                radius: obj.radius
            }
        }
        return results
    }
}