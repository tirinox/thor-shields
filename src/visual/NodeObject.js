import * as THREE from "three";
import {Vector3} from "three";
import {Random, Util} from "@/helpers/MathUtil";
import {Text} from 'troika-three-text'
import {Colors, Config} from "@/config";
import {PhysicalObject} from "@/helpers/physics/PhysicalObject";
import StdVertexShader from '@/visual/shader/standard.vert'
// import FragShader1 from '@/visual/shader/node_obj_1.frag'
import FragShader1 from '@/visual/shader/node_obj_2.frag'
// import FragShader1 from '@/visual/shader/node_obj_3_rays.frag'
import {NodeStatus} from "@/helpers/NodeTracker";
import {randFloat} from "three/src/math/MathUtils";


const noCfg = Config.Scene.NodeObject

// const geometry = new THREE.SphereGeometry(0.5, 32, 32)
// const geometry = new THREE.IcosahedronGeometry(1, 1)
const geometry = new THREE.PlaneGeometry(noCfg.PlaneScale, noCfg.PlaneScale)


export class NodeObject extends PhysicalObject {
    constructor(node) {
        super()

        this.node = node
        this.normalizedBond = this.node.bond / 1_000_000  // millions of Rune

        this.o = new THREE.Group()

        this.attractors = []
        // this.mass = this.normalizedBond * 2.0
        this.friction = 0.025

        this._makeSphere()
        this._makeLabel()
    }

    _makeSphere() {
        // color
        let color = 0x111111;
        let z = randFloat(-0.1, 0.1)
        const st = this.node.status
        if (st === NodeStatus.Standby) {
            color = 0x167a56
        } else if (st === NodeStatus.Active) {
            color = Random.getRandomSample([
                Colors.LightningBlue,
                Colors.YggdrasilGreen
            ])
            z -= 0.3
        } else if (st === NodeStatus.Disabled) {
            color = 0xee0000
        } else if (st === NodeStatus.Whitelisted) {
            color = 0x444444
        } else if (st === NodeStatus.Unknown) {
            color = 0x111144
        }
        const colorObj = new THREE.Color(color)

        // material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                "time": {value: Random.getRandomFloat(0.0, 100.0)},
                "saturation": {value: 1.0},
                "color": {value: colorObj},
            },
            vertexShader: StdVertexShader,
            fragmentShader: FragShader1,
            transparent: true,
            depthTest: false,
        })

        // Size (scale): 1 = 1 million Rune
        const scale = this.calculateScale

        // this.material = new THREE.MeshStandardMaterial({color, flatShading: true});
        // this.material = NodeObject.material
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.scale.setScalar(scale)
        this.mesh.position.z = z
        this.mesh.name = this.node.address
        this.o.add(this.mesh)
    }

    get calculateScale() {
        const scale = this.normalizedBond * noCfg.MaxScale
        return Util.clamp(scale, noCfg.MinScale, noCfg.MaxScale)
    }

    get realObject() {
        return this.o
    }

    _makeLabel() {
        const address = this.node.address
        if (address && address.length >= 4) {
            const nameTextObj = this.nameTextObj = new Text()

            nameTextObj.text = address.slice(-4)
            nameTextObj.font = Config.Font.Main
            nameTextObj.fontWeight = 900
            nameTextObj.fontSize = 15
            nameTextObj.position.z = 2.42
            nameTextObj.color = 0xFFFFFF
            nameTextObj.anchorX = 'center'
            nameTextObj.anchorY = 'middle'
            nameTextObj.outlineWidth = 2.0
            nameTextObj.sync()
            nameTextObj.name = this.node.address
            this.o.add(nameTextObj)
        }
    }

    dispose() {
        if (this.nameTextObj) {
            this.nameTextObj.dispose()
        }
        this.material.dispose()
    }

    get radius() {
        return Math.max(12, this.mesh.scale.x * noCfg.PlaneScale * 0.5)
    }

    reactChain() {
        // this.mesh.rotateZ(1.0)
        const pos = this.o.position.clone().normalize()
        const perp = pos.cross(new Vector3(0, 0, 1)).multiplyScalar(100.0)
        this.velocity.add(perp)
    }

    reactSlash() {
        const velocity = this.o.position.clone().normalize().multiplyScalar(100)
        this.velocity.copy(velocity)

        const savedColor = this.material.color.clone()
        this.velocity.set(Random.getRandomFloat(-100, 100), Random.getRandomFloat(-100, 100), 0.0)
        this.material.color.set(0xff3300)
        setTimeout(() => {
            this.material.color.set(savedColor)
        }, 100)
    }

    static estimateRadiusOfGroup(nodeObjList) {
        let r = 0.0
        for (const nodeObj of nodeObjList) {
            r += nodeObj.radius
        }
        const n = nodeObjList.length
        const avgRadius = r > 0 ? r / n : 0.0
        const fitRadius = avgRadius * Math.sqrt(n)
        return Math.max(0.1, fitRadius)
    }

    update(dt) {
        super.update(dt);

        this.material.uniforms.time.value += dt
    }
}
