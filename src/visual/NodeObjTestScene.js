import * as THREE from "three";
import {clearObject} from "@/helpers/3D";
import {dbgSimulateLoaded} from "@/helpers/EventTypes";
import {NodeObject} from "@/visual/NodeObject";
import {NodeInfo} from "@/helpers/data/NodeInfo";
import TWEEN from "tween.js";

export class NodeObjTestScene {
    constructor(scene, camera) {
        this.scene = scene
        this.camera = camera

        this._makeSomeLight()

        dbgSimulateLoaded()

        this.nodeObj = new NodeObject(new NodeInfo({
            node_address: 'thor123',
            status: 'Active',
            bond: 100000000000000000,
            version: '1.96.2',
        }))

        this.nodeObj.labelObj.visible = false

        this.nodeObj.material.uniforms.rust.value = -1.0

        new TWEEN.Tween(this.nodeObj.material.uniforms.rust)
            .to({value: 1.0}, 2000)
            .repeat(Infinity)
            .yoyo(true)
            .start()

        this.nodeObj.o.position.set(0, 0, 1500)
        scene.add(this.nodeObj.o)

        this.camera.zoom = 100
    }

    _makeSomeLight() {
        // const light = new THREE.DirectionalLight('hsl(0, 100%, 100%)')
        // light.position.set(0, 10, 1000)
        // this.scene.add(light)

        const ambientLight = new THREE.AmbientLight(0xffffff); // soft white light
        this.scene.add(ambientLight);
    }

    update(delta) {
        this.nodeObj.update(delta * 0.1)
    }

    dispose() {
        clearObject(this.scene)
    }
}
