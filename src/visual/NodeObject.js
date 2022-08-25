import * as THREE from "three";
import {MeshBasicMaterial, Vector3} from "three";
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
import {createBillboardMaterial} from "@/helpers/TextBillboard";


const noCfg = Config.Scene.NodeObject

// const geometry = new THREE.SphereGeometry(0.5, 32, 32)
// const geometry = new THREE.IcosahedronGeometry(noCfg.PlaneScale, 1)
const geometry = new THREE.PlaneGeometry(noCfg.PlaneScale, noCfg.PlaneScale)
const simpleGeometry = new THREE.SphereGeometry(noCfg.PlaneScale * 0.5, 10, 10)

const SlashColor = 0xff3300

const NormalLabelZ = 2.42

export class NodeObject extends PhysicalObject {
    constructor(node) {
        super()

        this.node = node
        this.normalizedBond = this.node.bond / 1_000_000  // millions of Rune
        this.mass = this.normalizedBond + 1.0

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

    _getSphereColor() {
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
        return new THREE.Color(color)
    }

    _makeSphere() {
        if(Config.Scene.NodeObject.Simple) {
            this._makeSimpleSphere()
        } else {
            this._makeCoolSphere()
        }
        const scale = this.calculateScale

        // this.mesh = new THREE.Sprite(this.material)
        let z = randFloat(-0.1, 0.1)

        this.mesh.name = this.name
        this.mesh.renderOrder = 1
        this.mesh.scale.setScalar(scale)
        this.mesh.position.z = z
        this.o.renderOrder = 1
        this.o.add(this.mesh)
    }

    _makeSimpleSphere() {
        // simpleGeometry
        this.mesh = new THREE.Mesh(simpleGeometry, new THREE.MeshBasicMaterial({
            color: this._getSphereColor()
        }))
    }

    _makeCoolSphere() {
        // material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                "time": {value: Random.getRandomFloat(0.0, 100.0)},
                "saturation": {value: 1.0},
                "color": {value: this._getSphereColor()},
            },
            vertexShader: StdVertexShader,
            fragmentShader: FragShader1,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            // sizeAttenuation: true,
        })
        this.mesh = new THREE.Mesh(geometry, this.material);
        return this.mesh
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
            nameTextObj.renderOrder = 100
            nameTextObj.name = this.name
            nameTextObj.material = createBillboardMaterial(new MeshBasicMaterial())
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
        return Math.max(12, this.mesh.scale.x * noCfg.PlaneScale * noCfg.RadiusFactor)
    }

    reactChain() {
        // this.mesh.rotateZ(1.0)
        const pos = this.o.position.clone().normalize()
        const perp = pos.cross(new Vector3(0, 0, 1)).multiplyScalar(100.0)
        this.velocity.add(perp)
    }

    reactSlash() {
        const slashForce = 100.0
        this.shootOut(slashForce)
        // this.velocity.set(Random.randomOnCircle(slashForce))

        const savedColor = this.material.uniforms.color.value.clone()

        if(this.material) {
            this.material.uniforms.color.value.set(SlashColor)
            this.material.uniformsNeedUpdate = true

            setTimeout(() => {
                this.material.uniforms.color.value.set(savedColor)
                this.material.uniformsNeedUpdate = true
            }, 100)
        }
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

        if(this.material) {
            this.material.uniforms.time.value += dt
        }
    }
}
