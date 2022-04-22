import * as THREE from "three";
import {Text} from 'troika-three-text'
import {Config} from "@/config";

export class TitleLabel3D extends THREE.Object3D {
    constructor(text, scale=20) {
        super();
        this.text = text
        const t = this.label = new Text()
        t.font = Config.Font.Main
        t.fontSize = 10
        t.scale.set(scale, scale, scale)
        t.color = 0xFFFFFF
        t.fillOpacity = 0.5
        t.anchorX = 'center'
        t.anchorY = 'middle'
        t.text = text
        t.sync()
        t.rotateX(-1)
        this.add(t)
    }

    animateIn() {}
    animateOut() {}
}