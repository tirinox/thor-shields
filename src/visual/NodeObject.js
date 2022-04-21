import * as THREE from "three";
import {Vector3} from "three";
import {Random, Util} from "@/helpers/MathUtil";
import {NodeStatus} from "@/helpers/NodeTracker";
import {Text} from 'troika-three-text'
import {Colors, Config} from "@/config";
import {PhysicalObject} from "@/helpers/physics/PhysicalObject";

// const geometry = new THREE.SphereGeometry(1, 32, 32)
const geometry = new THREE.IcosahedronGeometry(1, 1)

const minScale = 8.0
const maxScale = 52.0

export class NodeObject extends PhysicalObject {
    constructor(node) {
        super()

        this.node = node

        this.o = new THREE.Group()

        this._attractor = null

        this._makeSphere()
        this._makeLabel()
    }

    _makeSphere() {
        // color
        let color = 0x111111;
        const st = this.node.status
        if (st === NodeStatus.Standby) {
            color = 0x167a56
        } else if (st === NodeStatus.Active) {
            color = Random.getRandomSample([
                Colors.LightningBlue,
                Colors.YggdrasilGreen
            ])
        } else if (st === NodeStatus.Disabled) {
            color = 0xee0000
        } else if (st === NodeStatus.Whitelisted) {
            color = 0x444444
        } else if (st === NodeStatus.Unknown) {
            color = 0x111144
        }

        // Size (scale): 1 = 1 million Rune
        this.normalizedBond = (Number(this.node.bond / 10_000_000n)) * 0.0000001
        const scale = Util.clamp(this.normalizedBond * maxScale * 0.8,
            minScale, maxScale)

        this.material = new THREE.MeshStandardMaterial({color, flatShading: true});
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.scale.setScalar(scale)
        this.o.add(this.mesh)
    }

    _makeLabel() {
        const address = this.node.node_address
        if (address && address.length >= 4) {
            const nameTextObj = this.nameTextObj = new Text()

            nameTextObj.text = address.slice(-4)
            nameTextObj.font = Config.Font.Main
            nameTextObj.fontWeight = 900
            nameTextObj.fontSize = 15
            nameTextObj.position.z = 40
            nameTextObj.color = 0xFFFFFF
            nameTextObj.sync()
            nameTextObj.anchorX = 'center'
            nameTextObj.anchorY = 'middle'
            this.o.add(nameTextObj)
        }
    }

    dispose() {
        if (this.nameTextObj) {
            this.nameTextObj.dispose()
        }
    }

    get radius() {
        return this.mesh.scale.x
    }

    update(dt) {
        if(this._attractor) {
            this._attractor.applyForce(this)
        }
        super.update(dt)
    }

    reactChain() {
        this.mesh.rotateX(1.0)
        const pos = this.o.position.clone().normalize()
        const perp = pos.cross(new Vector3(0, 0, 1)).multiplyScalar(100.0)
        this.velocity.add(perp)
    }

    reactSlash() {
        // const velocity = obj.o.position.clone().normalize().multiplyScalar(100)
        // obj.velocity.copy(velocity)

        const savedColor = this.material.color.clone()
        this.velocity.set(Random.getRandomFloat(-100, 100), Random.getRandomFloat(-100, 100), 0.0)
        this.material.color.set(0xff0000)
        setTimeout(() => {
            this.material.color.set(savedColor)
        }, 100)
    }
}