import _ from "lodash";
import CirclePacker from "circlepacker";
import * as THREE from "three";
import {Attractor} from "@/helpers/physics/Attractor";

export class CirclePack {
    constructor(circles, force=500, fieldSize=2000) {
        this.circles = circles
        this.fieldSize = fieldSize
        this.centerPasses = 5000
        this.collisionPasses = 100
        this.force = force
        this.initalRaidus = fieldSize * 0.5 * 0.8
    }

    pack() {
        if(!this.circles.length) {
            return []
        }

        const center = this.fieldSize * 0.5
        const deltaAngle = 3.1415 * 2 / this.circles.length
        let angle = 0.0

        const circles = []
        for (const circle of this.circles) {
            circles.push(
                {
                    id: circle.name,
                    radius: circle.radius,
                    position: {
                        x: center + this.initalRaidus * Math.cos(angle),
                        y: center +this.initalRaidus * Math.sin(angle)
                    },
                    isPulledToCenter: false,
                    isPinned: false
                },
            )
            angle += deltaAngle
        }

        console.log(circles)

        return new Promise((resolve) => {
            const packer = new CirclePacker({
                collisionPasses: this.collisionPasses,
                centeringPasses: this.centerPasses,
                target: {x: center, y: center},
                bounds: {width: this.fieldSize, height: this.fieldSize},
                continuousMode: false,
                circles,
                onMove: (poses) => {
                    const attractors = {}
                    for (const [name, circle] of _.entries(poses)) {
                        const target = new THREE.Vector3(circle.position.x - center, circle.position.y - center, 0.0)
                        attractors[name] = new Attractor(target,
                            this.force, 0, 0, 0.0, circle.radius)
                        attractors[name].name = name
                    }
                    resolve(attractors)
                }
            })
            packer.update()
        })
    }
}