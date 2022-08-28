import * as THREE from "three";
import {MeshBasicMaterial} from "three";
import {Text} from 'troika-three-text'
import {Config} from "@/config";
import TWEEN from "tween";
import {createBillboardMaterial} from "@/helpers/TextBillboard";

export class TitleLabel3D extends THREE.Object3D {
    constructor(text, scale = 20, rotAngle = -45, billboard = false) {
        super();
        this.text = text
        const t = this.label = new Text()
        t.font = Config.Font.Main
        t.fontSize = 10
        t.scale.set(scale, scale, scale)
        t.color = 0xFFFFFF
        t.fillOpacity = 1.0 // 0.5
        t.anchorX = 'center'
        t.anchorY = 'middle'
        t.text = text
        if (billboard) {
            t.material = createBillboardMaterial(new MeshBasicMaterial())
        }
        t.rotateX(THREE.MathUtils.degToRad(rotAngle))
        t.sync()
        this.t = t
        this.add(t)
        this.animDuration = 500
        this.animDistance = 1500
        this.easeType = TWEEN.Easing.Back.Out
    }

    animateIn() {
        this.t.position.z = this.animDistance
        this.t.material.opacity = 0.0

        new TWEEN.Tween(this.t.position)
            .to({z: 0}, this.animDuration)
            .easing(this.easeType)
            .start()

        new TWEEN.Tween(this.t.material)
            .to({opacity: 1.0}, this.animDuration)
            .easing(this.easeType)
            .start()
    }

    animateOut(kill = false) {
        const expandedDuration = this.animDuration * 5
        new TWEEN.Tween(this.t.position)
            .to({z: -this.animDistance * 5}, expandedDuration)
            .easing(this.easeType)
            .start()

        new TWEEN.Tween(this.t.material)
            .to({opacity: 0.0}, expandedDuration)
            .easing(this.easeType)
            .start().onComplete(() => {
            if (kill) {
                this.parent.remove(this)
            }
        })
    }
}