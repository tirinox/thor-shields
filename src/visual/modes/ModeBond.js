import {ModeBase} from "@/visual/modes/ModeBase";
import * as THREE from "three";
import _ from "lodash";
import {Attractor} from "@/helpers/physics/Attractor";
import {Config} from "@/config";

export class ModeBond extends ModeBase {
    constructor(scene) {
        super(scene);
        this.nameToAttractor = {}
        this.force = Config.Physics.BaseForce
    }

    handleObject(physObj) {
        super.handleObject(physObj);
        const attractor = this.nameToAttractor[physObj.node.address]
        physObj.attractors = attractor ? [attractor] : []
    }

    onEnter(nodeObjects) {
        const label = this.makeLabel('Bonds', new THREE.Vector3(0, -580, -10), 14)
        label.t.opacity = 0.8;

        nodeObjects = _.sortBy(nodeObjects, 'node.bond')
        const n = nodeObjects.length

        this.nameToAttractor = {}

        if (n === 0) {
            return
        }

        const columns = Math.ceil(Math.sqrt(n))
        const rows = Math.ceil(n / columns)

        const gapSize = 100.0
        const width = columns * gapSize
        const height = rows * gapSize
        const halfWidth = 0.5 * width
        const halfHeight = 0.5 * height

        for (let i = 0; i < n; ++i) {
            const col = i % columns
            const row = Math.floor(i / columns)
            const x = gapSize * col - halfWidth
            const y = gapSize * row - halfHeight

            const no = nodeObjects[i]
            console.log(no.node.address, no.node.bond, x, y)

            this.nameToAttractor[no.node.address] = new Attractor(new THREE.Vector3(x, y, 0),
                this.force, 0, 0, -1, 10.0)
        }

        super.onEnter();
    }
}
