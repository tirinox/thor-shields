import * as THREE from "three";
import {Vector3} from "three";
import {Util} from "@/helpers/MathUtil";
import {NodeStatus} from "@/helpers/NodeTracker";
import {Text} from 'troika-three-text'

// const geometry = new THREE.SphereGeometry(1, 32, 32)
const geometry = new THREE.SphereGeometry(1, 10, 10)

export class NodeObject {
    constructor(node) {
        this.node = node
        let color = 0xaaaaaa;
        const st = node.status
        if (st === NodeStatus.Standby) {
            color = 0xffff00
        } else if (st === NodeStatus.Active) {
            color = 0x00ff00
        } else if (st === NodeStatus.Disabled) {
            color = 0xff0000
        } else if (st === NodeStatus.Whitelisted) {
            color = 0xaaaaaa
        } else if (st === NodeStatus.Unknown) {
            color = 0xaa0000
        }
        this.o = new THREE.Group()

        this.material = new THREE.MeshLambertMaterial({color});
        this.mesh = new THREE.Mesh(geometry, this.material);

        const scale = Util.clamp(
            Math.log10(Number(node.bond / 10_000_000n)) * 4.0,
            1.0, 1000)
        this.mesh.scale.setScalar(scale)
        this.o.add(this.mesh)

        this.mass = 1.0
        this.force = new Vector3()
        this.velocity = new Vector3()
        this.friction = 0.0

        if (node.node_address && node.node_address.length >= 4) {
            const nameTextObj = this.nameTextObj = new Text()
            nameTextObj.text = node.node_address.slice(-4)
            nameTextObj.fontSize = 15
            nameTextObj.position.z = 100
            nameTextObj.color = 0xFFFFFF
            nameTextObj.sync()
            nameTextObj.anchorX = 'center'
            nameTextObj.anchorY = 'middle'
            this.o.add(nameTextObj)
        }
    }

    dispose() {
        if(this.nameTextObj) {
            this.nameTextObj.dispose()
        }
    }

    update(dt) {
        const acceleration = this.force.multiplyScalar(this.mass)
        this.velocity.copy(this.velocity.clone().add(acceleration.multiplyScalar(dt)))
        this.velocity.multiplyScalar(Util.clamp(1.0 - this.friction, 0.0, 1.0))
        this.o.position.copy(this.o.position.clone().add(this.velocity.clone().multiplyScalar(dt)))
    }
}