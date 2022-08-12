import {ModeBase} from "@/visual/modes/ModeBase";
import * as THREE from "three";
import _ from "lodash";
import {Attractor} from "@/helpers/physics/Attractor";
import {Config} from "@/config";
import {shortRune} from "@/helpers/MathUtil";

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
        const label = this.makeLabel('Bonds', new THREE.Vector3(0, -630, -10), 14)
        label.t.opacity = 0.8;

        nodeObjects = _.sortBy(nodeObjects, 'node.bond')

        const n = nodeObjects.length

        this.nameToAttractor = {}

        if (n === 0) {
            return
        }

        this._positionateOnSpiral(nodeObjects)

        super.onEnter();
    }

    _positionateOnSpiral(nodeObjects) {
        const n = nodeObjects.length
        const center = new THREE.Vector3(0, 120)
        let angle = 0.0
        let radius = 0.0
        // let gap = 3.0
        const xScale = 1.5

        let deltaRadius = 5.0;
        let deltaAngle = 0.5;
        const deltaDeltaRadius = 0.995;
        const deltaDeltaAngle = 0.991;

        for (let i = 0; i < n; ++i) {
            radius += deltaRadius;
            angle += deltaAngle;
            deltaRadius *= deltaDeltaRadius
            deltaAngle *= deltaDeltaAngle

            const x = center.x + xScale * radius * Math.cos(angle)
            const y = center.y + radius * Math.sin(angle)
            this._addAttractor(nodeObjects[i], x, y)
        }
    }

    _positionateOnGrid(nodeObjects) {
        const n = nodeObjects.length

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
            this._addAttractor(nodeObjects[i], x, y)
        }
    }

    _addAttractor(nodeObject, x, y) {
        const z = nodeObject.o.position.z
        this.nameToAttractor[nodeObject.node.address] = new Attractor(new THREE.Vector3(x, y, z),
            this.force, 0, 0, -1, 10.0)

        const bond = nodeObject.node.bond
        if(bond > 1) {
            this.makeLabel(shortRune(bond), new THREE.Vector3(x, y - 30.0, -10), 1)
        }
    }
}
