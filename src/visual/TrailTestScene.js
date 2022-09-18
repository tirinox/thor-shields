import * as THREE from "three";
import {clearObject} from "@/helpers/3D";
import {TrailTesting} from "@/visual/helpers/TrailTesting";
import {dbgSimulateLoaded} from "@/helpers/EventTypes";

export class TrailTestScene {
    constructor(scene, cameraController) {
        this.scene = scene
        this.cameraController = cameraController

        this._makeSomeLight()

        this.trailTester = new TrailTesting(this.scene)

        dbgSimulateLoaded()
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
