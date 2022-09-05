import * as THREE from "three";
import {Config} from "@/config";
import CameraControls from "camera-controls";
import TWEEN from "tween";

export class CameraController {
    constructor(domElement, center = new THREE.Vector3()) {
        this.domElement = domElement
        this.center = center
        this._createCamera()
        this._createCameraControl()
        this._animating = false
        this.controlsEnabled = true
    }

    reset() {
        this.controls.reset()
    }

    _createCamera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
            0.001, Config.Controls.Camera.Distance.Max * 2);
        // this.camera = new THREE.OrthographicCamera()
        this.camera.position.z = Config.Controls.Camera.Distance.Start
    }

    _createCameraControl() {
        const controls = this.controls = new CameraControls(this.camera, this.domElement);
        const cfg = Config.Controls.Camera

        controls.dragToOffset = true
        controls.minDistance = cfg.Distance.Min
        controls.maxDistance = cfg.Distance.Max
        this.camera.position.z = cfg.Distance.Start

        controls.minAzimuthAngle = THREE.MathUtils.degToRad(-cfg.AzimuthAngleLimit)
        controls.maxAzimuthAngle = THREE.MathUtils.degToRad(cfg.AzimuthAngleLimit)

        controls.minPolarAngle = THREE.MathUtils.degToRad(-cfg.PolarAngleLimit + 90)
        controls.maxPolarAngle = THREE.MathUtils.degToRad(cfg.PolarAngleLimit + 90)

        controls.update(0)
    }

    update(delta) {
        if (this.controlsEnabled && !this._animating && !this.cameraInspectsObject) {
            this.controls.update(delta);
        }
        // todo: if we look at the object, keep tracking it while it moves around
    }

    onResize() {
        const canvas = this.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    _getEndQuaternion(target, lookAtThis) {
        const currPos = this.camera.position.clone()
        const currQ = this.camera.quaternion.clone()

        this.camera.position.copy(target)
        this.camera.lookAt(lookAtThis)

        const endQuaternion = this.camera.quaternion.clone()

        this.camera.position.copy(currPos)
        this.camera.quaternion.copy(currQ)

        return endQuaternion
    }

    cameraLookAtNode(nodeObj, flat) {
        if (!this.cameraInspectsObject) {
            this.oldCameraPos = this.camera.position.clone()
            this.oldCameraQuaternion = this.camera.quaternion.clone()
            this.cameraInspectsObject = true
        }

        this._animating = true

        const cfg = Config.Controls.Camera.Animation

        const that = this

        let target
        let targetLookAt

        if(flat) {
            target = nodeObj.o.position.clone().add(new THREE.Vector3(0, 0, cfg.DistanceWhenZoomed))
            targetLookAt = nodeObj.o.position.clone()
        } else {
            const deltaVector = nodeObj.o.position.clone().normalize().multiplyScalar(cfg.DistanceWhenZoomed)
            target = nodeObj.o.position.clone().add(deltaVector)
            targetLookAt = nodeObj.o.position.clone()
        }

        new TWEEN.Tween(this.camera.position)
            .to(target, cfg.Duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onComplete(() => {
                that._animating = false
            })
            .start();

        const endQuaternion = this._getEndQuaternion(target, targetLookAt)
        new TWEEN.Tween(this.camera.quaternion)
            .to(endQuaternion, cfg.Duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start()
    }

    restoreCamera() {
        if (this.cameraInspectsObject) {
            this.cameraInspectsObject = false
            this._animating = true

            const that = this
            const animTime = Config.Controls.Camera.Animation.Duration
            new TWEEN.Tween(this.camera.position)
                .to(this.oldCameraPos, Config.Controls.Camera.Animation.Duration)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(function () {
                    // that.camera.position.copy(this);
                    // that.camera.lookAt(that.center)
                })
                .onComplete(() => {
                    that._animating = false
                })
                .start();

            const endQuaternion = this._getEndQuaternion(this.oldCameraPos, this.center)
            new TWEEN.Tween(this.camera.quaternion)
                .to(endQuaternion, animTime)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .start()
        }
    }

    dispose() {
        this.controls.dispose()
    }
}
