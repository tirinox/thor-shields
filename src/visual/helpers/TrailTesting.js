import * as THREE from "three";
import {TrailRenderer} from "@/visual/helpers/TrailRenderer";
import {Colors} from "@/config";

export class TrailTesting {
    constructor(scene) {
        this.scene = scene

        this.baseTrailMaterial = TrailRenderer.createBaseMaterial();

        this.material = this.baseTrailMaterial
        this.material.depthWrite = false

        this.circlePoints = this.makeCircle()
        this.makeTrailTarget(this.circlePoints)
        this.makeTrail()
        this._makeFlyState()
    }

    makeTrail() {
        const trailLength = 300.0
        this.trail = new TrailRenderer(this.scene, false);
        this.trail.initialize(
            this.material,
            Math.floor(trailLength),
            0.0, 0,
            this.circlePoints,
            this.trailTarget);

        this.updateColors(
            new THREE.Color(Colors.LightningBlue),
            new THREE.Color(Colors.YggdrasilGreen)
        )
        this.trail.activate();
    }

    updateColors(headColor, trialColor) {
        this.material.uniforms.headColor.value.copy(headColor);
        this.material.uniforms.tailColor.value.copy(trialColor);
    }

    _makeFlyState() {
        this.lastTrailUpdateTime = 0.0
        this._t = 0.0

        this.lastDirection = new THREE.Vector3();
        this.lastTargetPosition = new THREE.Vector3();
        this.lastRotationMatrix = new THREE.Matrix4();
        this.currentTargetPosition = new THREE.Vector3();
        this.currentDirection = new THREE.Vector3();

        this.tempQuaternion = new THREE.Quaternion();

        this.baseForward = new THREE.Vector3(0, 0, -1);
        this.tempUp = new THREE.Vector3();

        this.tempRotationMatrix = new THREE.Matrix4();
        this.tempTranslationMatrix = new THREE.Matrix4();

    }

    update(dt) {
        if(dt <= 0) {
            return
        }

        this._t += dt

        const areaScale = 100;
        const trailGrowTime = 10.0 * 1000.0

        if (this._t - this.lastTrailUpdateTime > trailGrowTime) {
            this.trail.advance();
            this.lastTrailUpdateTime = this._t;
        } else {
            this.trail.updateHead();
        }

        const scaledTime = this._t;

        this.lastTargetPosition.copy(this.currentTargetPosition);

        this.currentTargetPosition.x = Math.sin(scaledTime) * areaScale;
        this.currentTargetPosition.y = Math.sin(scaledTime * 1.1) * areaScale;
        this.currentTargetPosition.z = Math.sin(scaledTime * 1.6) * areaScale;

        // console.log(this.currentTargetPosition)

        this.lastDirection.copy(this.currentDirection);

        this.currentDirection.copy(this.currentTargetPosition);
        this.currentDirection.sub(this.lastTargetPosition);
        this.currentDirection.normalize();

        this.tempUp.crossVectors(this.currentDirection, this.baseForward);

        this.tempRotationMatrix.identity();

        const angle = this.baseForward.angleTo(this.currentDirection);
        if (Math.abs(angle) > .01 && this.tempUp.lengthSq() > .001) {
            this.tempQuaternion.setFromUnitVectors(this.baseForward, this.currentDirection);
            this.tempQuaternion.normalize();
            this.tempRotationMatrix.makeRotationFromQuaternion(this.tempQuaternion);
            this.lastRotationMatrix.copy(this.tempRotationMatrix);
        }

        this.tempTranslationMatrix.identity();
        this.tempTranslationMatrix.makeTranslation(
            this.currentTargetPosition.x,
            this.currentTargetPosition.y,
            this.currentTargetPosition.z
        );

        // this.tempTranslationMatrix.multiply(this.tempRotationMatrix);
        this.tempRotationMatrix.multiply(this.tempTranslationMatrix);

        this.trailTarget.matrix.identity();
        // this.trailTarget.applyMatrix4(this.tempTranslationMatrix);
        this.trailTarget.applyMatrix4(this.tempRotationMatrix);
        this.trailTarget.updateMatrixWorld();
    }

    makeCircle() {
        let circlePoints = [];
        const twoPI = Math.PI * 2;
        let index = 0;
        const scale = 10.0;
        const inc = twoPI / 32.0;

        for (let i = 0; i <= twoPI + inc; i += inc) {
            circlePoints[index] = new THREE.Vector3(Math.cos(i) * scale, Math.sin(i) * scale, 0);
            index++;
        }
        return circlePoints
    }

    makeTrailTarget(points) {
        const starShape = new THREE.Shape(points);

        const extrusionSettings = {
            depth: 2, size: 2, height: 1, curveSegments: 3,
            bevelThickness: 1, bevelSize: 2, bevelEnabled: false,
            material: 0, extrudeMaterial: 1
        };

        const starGeometry = new THREE.ExtrudeGeometry(starShape, extrusionSettings);

        const trailTargetMaterial = new THREE.MeshPhongMaterial({
            color: 0xa0adaf,
            shininess: 10,
            specular: 0x111111,
            flatShading: false,
        });

        const trailTarget = this.trailTarget = new THREE.Mesh(starGeometry, trailTargetMaterial);
        trailTarget.receiveShadow = false;

        this.scene.add(trailTarget);
    }
}