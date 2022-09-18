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
import {randFloat} from "three/src/math/MathUtils";
import {clamp} from "lodash";
import {createBillboardMaterial} from "@/helpers/TextBillboard";
import {NodeEvent} from "@/helpers/NodeEvent";
import {NodeStatus} from "@/helpers/data/NodeInfo";
import TWEEN from "tween";


const noCfg = Config.Scene.NodeObject
const geomSize = noCfg.PlaneScale

// const geometry = new THREE.SphereGeometry(noCfg.PlaneScale * 0.5, 10, 10)
const geometry = new THREE.BoxGeometry(geomSize, geomSize, geomSize)
// const geometry = new THREE.IcosahedronGeometry(noCfg.PlaneScale, 1)
// const geometry = new THREE.PlaneGeometry(noCfg.PlaneScale, noCfg.PlaneScale)
const simpleGeometry = new THREE.SphereGeometry(noCfg.PlaneScale * 0.5, 10, 10)

const SlashColor = 0xff3300

const NormalLabelZ = 42.42

const CirclePackFactor = 1 / Math.sqrt(0.72)

export class NodeObject extends PhysicalObject {
    constructor(node) {
        super()

        this.node = node
        this.normalizedBond = this.node.bond / 1_000_000  // millions of Rune
        this.mass = this.normalizedBond + 1.0

        this.o = new THREE.Group()
        this.o.name = this.name

        this.attractors = []
        this.mass = 1.0 + this.normalizedBond * 2.0
        this.friction = Config.Physics.BaseFriction

        this._makeSphere()
        this._makeLabel()

        this._reactingToSlash = false
        this._elevated = false
    }

    get name() {
        return this.node.address
    }

    set elevated(v) {
        v = Boolean(v)
        if (this._elevated !== v) {
            this._elevated = v

            this.material.uniforms.saturation.value = this._elevated ? 1.5 : 1.0
            this.material.uniformsNeedUpdate = true
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
        } else if (st === NodeStatus.Ready) {
            color = 0x167a8f
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
        if (!this.mesh) {
            if (Config.Scene.NodeObject.Simple) {
                this._makeSimpleSphere()
            } else {
                this._makeCoolSphere()
            }
        }

        if (this.material.uniforms) {
            this.material.uniforms.color.value = this._getSphereColor()
            this.material.uniformsNeedUpdate = true
        }

        this.mesh.name = this.name
        this.mesh.renderOrder = 1

        const scale = this.calculateScale
        this.mesh.scale.setScalar(scale)

        this.mesh.position.z = randFloat(-0.1, 0.1)
        this.o.renderOrder = 1
        this.o.add(this.mesh)
    }

    _makeSimpleSphere() {
        // simpleGeometry
        this.material = new THREE.MeshBasicMaterial({
            color: this._getSphereColor()
        })
        this.mesh = new THREE.Mesh(simpleGeometry, this.material)
    }

    _makeCoolSphere() {
        if (!this.material) {
            this._makeMaterial()
        }

        this.mesh = new THREE.Mesh(geometry, this.material);
        return this.mesh
    }

    _makeMaterial() {
        // material

        // fixme: debug 0.0
        const initRust = Math.random()

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                "time": {value: Random.getRandomFloat(0.0, 100.0)},
                "saturation": {value: 1.0},
                "color": {value: this._getSphereColor()},
                "transitionShininess": {value: 0.0},
                "rust": {value: initRust},  // 0.0
            },
            vertexShader: StdVertexShader,
            fragmentShader: FragShader1,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            // sizeAttenuation: true,
        })
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
        return Math.max(noCfg.MinRadius, this.mesh.scale.x * noCfg.PlaneScale * noCfg.RadiusFactor)
    }

    static estimateRadiusOfGroup(nodeObjList) {
        let sum_r2 = 0.0
        for (const nodeObj of nodeObjList) {
            sum_r2 += nodeObj.radius * nodeObj.radius
        }
        const r = Math.sqrt(sum_r2)
        return Math.max(0.1, CirclePackFactor * r)
    }

    update(dt) {
        super.update(dt);

        if (this.material) {
            this.material.uniforms.time.value += dt
        }

        // todo: remove debug
        // if (Math.random() > 0.99) {
        //     this._animateTransitionShininess()
        // }
    }

    updateFromCamera(camera) {
        const dir = camera.position.clone().sub(this.position)
        dir.normalize().multiplyScalar(NormalLabelZ)
        this.nameTextObj.position.copy(dir)
    }

    // ----------------- R E A C T I O N S -------------------

    react(event) {
        this.node = event.node
        if (event.type === NodeEvent.EVENT_TYPE.OBSERVE_CHAIN) {
            this.reactChain()
        } else if (event.type === NodeEvent.EVENT_TYPE.SLASH) {
            this.reactSlash()
        } else if (event.type === NodeEvent.EVENT_TYPE.STATUS) {
            this.reactStatusChange(event.node.status)
        } else if(event.type === NodeEvent.EVENT_TYPE.VERSION) {
            this.reactVersion()
        }

        // if(Math.random() > 0.8) {
        //     this.reactSlash()
        // }
    }

    reactChain() {
        // update: node appearance according chain lag

        const chainReactionVelocity = 1.0 // 100
        // this.mesh.rotateZ(1.0)
        const pos = this.o.position.clone().normalize()
        const perp = pos.cross(new Vector3(0, 0, 1)).multiplyScalar(chainReactionVelocity)
        this.velocity.add(perp)
    }

    reactVersion() {
        this._animateTransitionShininess()
    }

    reactSlash() {
        if(this._reactingToSlash || !this.material) {
            return
        }

        const slashForce = 100.0
        this.shootOut(slashForce)
        // this.velocity.set(Random.randomOnCircle(slashForce))

        this._animateScale(0.82, 200, 600)

        this._reactingToSlash = true

        const savedColor = this.material.uniforms.color.value.clone()

        this.material.uniforms.color.value.set(SlashColor)
        this.material.uniformsNeedUpdate = true

        setTimeout(() => {
            this.material.uniforms.color.value.set(savedColor)
            this.material.uniformsNeedUpdate = true
            this._reactingToSlash = false
        }, 100)
    }

    reactStatusChange(newStatus) {
        console.log(`New status ${this.node.status} -> ${newStatus}`)
        this._animateTransitionShininess()
    }

    _getRust() {

    }

    _animateScale(targetScaleOfNormal,
                  durationIn = 1000,
                  durationOut = 1000,
                  easing =TWEEN.Easing.Sinusoidal.InOut ) {
        const normalScale = this.calculateScale
        const targetScale = targetScaleOfNormal * normalScale
        new TWEEN.Tween(this.mesh.scale)
            .to(new THREE.Vector3(targetScale, targetScale, targetScale), durationIn)
            .easing(easing)
            .start()
            .chain(
                new TWEEN.Tween(this.mesh.scale)
                    .to(new THREE.Vector3(normalScale, normalScale, normalScale), durationOut)
                    .easing(easing)
            )
    }

    _animateTransitionShininess() {
        const durationIn = 500.0
        const durationOut = durationIn * 2.5
        const easing = TWEEN.Easing.Sinusoidal.InOut

        new TWEEN.Tween(this.material.uniforms.transitionShininess)
            .to({value: 1.0}, durationIn)
            .easing(easing)
            .start().onComplete(() => {
            this._makeSphere()
        }).chain(
            new TWEEN.Tween(this.material.uniforms.transitionShininess)
                .to({value: 0.0}, durationOut)
                .easing(easing)
        )

        this._animateScale(1.5, durationIn, durationOut)
    }
}
