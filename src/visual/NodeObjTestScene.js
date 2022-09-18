import * as THREE from "three";
import {clearObject} from "@/helpers/3D";
import {dbgSimulateLoaded} from "@/helpers/EventTypes";
import {NodeObject} from "@/visual/NodeObject";
import {NodeInfo} from "@/helpers/data/NodeInfo";

export class NodeObjTestScene {
    constructor(scene, camera) {
        this.scene = scene
        this.camera = camera

        this._makeSomeLight()

        dbgSimulateLoaded()

        this.nodeObj = new NodeObject(new NodeInfo({
            node_address: 'thor123',
            status: 'Active',
            bond: 10000000000000000,
            version: '1.96.2',
        }))

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
        +delta
        // this.nodeObj.update(delta * 0.001)
    }

    dispose() {
        clearObject(this.scene)
    }
}
