import * as THREE from "three";
import {Vector3} from "three";
import {Random, Util} from "@/helpers/MathUtil";
import {Text} from 'troika-three-text'
import {Colors, Config} from "@/config";
import {PhysicalObject} from "@/helpers/physics/PhysicalObject";
import StdVertexShader from '@/visual/shader/billboard.vert'
// import StdVertexShader from '@/visual/shader/standard.vert'
// import FragShader1 from '@/visual/shader/node_obj_3_rays.frag'
// import FragShader1 from '@/visual/shader/node_obj_1.frag'
import FragShader1 from '@/visual/shader/node_obj_2.frag'
import {NodeStatus} from "@/helpers/NodeTracker";
import {randFloat} from "three/src/math/MathUtils";
import {clamp} from "lodash";


const noCfg = Config.Scene.NodeObject

// const geometry = new THREE.SphereGeometry(0.5, 32, 32)
// const geometry = new THREE.IcosahedronGeometry(noCfg.PlaneScale, 1)
const geometry = new THREE.PlaneGeometry(noCfg.PlaneScale, noCfg.PlaneScale)

const SlashColor = 0xff3300

const NormalLabelZ = 2.42

export class NodeObject extends PhysicalObject {
    constructor(node) {
        super()

        this.node = node
        this.normalizedBond = this.node.bond / 1_000_000  // millions of Rune

        this.o = new THREE.Group()
        this.o.name = this.name

        this.attractors = []
        // this.mass = this.normalizedBond * 2.0
        this.friction = Config.Physics.BaseFriction

        this._makeSphere()
        this._makeLabel()

        this._elevated = false
    }

    get name() {
        return this.node.address
    }

    set elevated(v) {
        v = Boolean(v)
        if(this._elevated !== v) {
            this._elevated = v

            this.material.uniforms.saturation.value = this._elevated ? 1.5 : 1.0
            this.material.uniformsNeedUpdate = true

            // if(this.nameTextObj) {
            //     this.nameTextObj.position.z = this._elevated ? 10.0 : NormalLabelZ
            // }
            // todo: add glow effect
        }
    }

    get elevated() {
        return this._elevated
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
            // sizeAttenuation: true,
        })

        this.normalColor = colorObj

        // Size (scale): 1 = 1 million Rune
        const scale = this.calculateScale

        // this.mesh = new THREE.Sprite(this.material)

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.scale.setScalar(scale)
        this.mesh.position.z = z
        this.mesh.name = this.name
        this.o.add(this.mesh)
    }

    get calculateScale() {
        const scale = this.normalizedBond * noCfg.MaxScale
        return Util.clamp(scale, noCfg.MinScale, noCfg.MaxScale)
    }

    get realObject() {
        return this.o
    }

    get position() {
        return this.o.position
    }

    _makeLabel() {
        const address = this.node.address
        if (address && address.length >= 4) {
            const nameTextObj = this.nameTextObj = new Text()

            nameTextObj.text = address.slice(-4)
            nameTextObj.font = Config.Font.Main
            nameTextObj.fontWeight = 900
            nameTextObj.fontSize = 15
            nameTextObj.position.z = NormalLabelZ
            nameTextObj.color = this.node.status === NodeStatus.Active ? 0xFFFFFF : 0xBBBBBB;
            nameTextObj.anchorX = 'center'
            nameTextObj.anchorY = 'middle'
            nameTextObj.outlineWidth = 2.0
            nameTextObj.sync()
            nameTextObj.name = this.name
            nameTextObj.scale.setScalar(
                clamp(this.normalizedBond * 1.1, 0.5, 1.5)
            )
            this.o.add(nameTextObj)
            this.labelObj = nameTextObj
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

        const savedColor = this.material.uniforms.color.value.clone()
        this.material.uniformsNeedUpdate = true
        this.velocity.set(Random.getRandomFloat(-100, 100), Random.getRandomFloat(-100, 100), 0.0)
        this.material.uniforms.color.value.set(SlashColor)
        setTimeout(() => {
            this.material.uniforms.color.value.set(savedColor)
            this.material.uniformsNeedUpdate = true
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
