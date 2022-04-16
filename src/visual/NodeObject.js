import * as THREE from "three";
import {Util} from "@/helpers/MathUtil";
import {Vector3} from "three";

const geometry = new THREE.SphereGeometry(1, 32, 32)

export class NodeObject {
    constructor(node) {
        this.node = node
        let color = 0xaaaaaa;
        const st = node.status.toLowerCase()
        if (st === 'standby') {
            color = 0xffff00
        } else if (st === 'active') {
            color = 0x00ff00
        } else if (st === 'disabled') {
            color = 0xff0000
        } else if (st === 'whitelisted') {
            color = 0xaaaaaa
        }
        this.material = new THREE.MeshLambertMaterial({color});
        this.o = new THREE.Mesh(geometry, this.material);

        const scale = Util.clamp(
            Math.log10(Number(node.bond / 10_000_000n)) * 2.0,
            0.1, 1000)
        this.o.scale.setScalar(scale)
        this.mass = 1.0
        const v = new Vector3()
        console.log(v)
        this.force = new Vector3()
        this.velocity = new Vector3()
    }

    update(dt) {
        const acceleration = this.force.multiplyScalar(this.mass)
        this.velocity.copy(this.velocity.clone().add(acceleration.multiplyScalar(dt)))
        this.o.position.copy(this.o.position.clone().add(this.velocity.clone().multiplyScalar(dt)))
    }
}