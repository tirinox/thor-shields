import * as THREE from "three";

export class VisNetwork extends THREE.Group {
    constructor(maxRadius = 30.0) {
        super();
        this.maxRadius = maxRadius

        this.material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2.0,
        });
    }

    update(delta) {
        +delta
    }

    updatePositions(rBush, positions) {
        // rBush = for quering nearby objects
        // positions: Array(THREE.Vector)
        const nearObjects = []

        const r = this.maxRadius

        for (const p of positions) {
            const candidates = rBush.search({
                minX: p.x - r,
                minY: p.y - r,
                maxX: p.x + r,
                maxY: p.y + r,
            })
            for (const candidate of candidates) {
                const otherPos = candidate.o.position
                const distance = otherPos.distanceTo(p)
                if (distance > 0.0 && distance < this.maxRadius) {
                    nearObjects.push(
                        {distance, p1: p, p2: otherPos}
                    )
                }
            }
        }

        for (const child of this.children) {
            child.removeFromParent()
        }

        for (const {p1, p2} of nearObjects) {
            // console.log(p1, p2)
            const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            const line = new THREE.Line(geometry, this.material)
            this.add(line)
        }
    }
}