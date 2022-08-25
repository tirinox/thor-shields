import * as THREE from "three";
import {clearObject} from "@/helpers/3D";
import {TrailTesting} from "@/visual/helpers/TrailTesting";

export class TrailTestScene {
    constructor(scene, vueComp) {
        this.scene = scene
        this.vueComp = vueComp

        this._makeSomeLight()

        this.trailTester = new TrailTesting(this.scene)
    }

    _makeSomeLight() {
        // const light = new THREE.DirectionalLight('hsl(0, 100%, 100%)')
        // light.position.set(0, 10, 1000)
        // this.scene.add(light)

        const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(ambientLight);
    }

    update(delta) {
        this.trailTester.update(delta)
    }

    dispose() {
        clearObject(this.scene)
    }
}