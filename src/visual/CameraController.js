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
        if (this.controlsEnabled && !this._animating) {
            this.controls.update(delta);
        }
    }

    onResize() {
        const canvas = this.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    cameraLookAtNode(nodeObj) {
        if (!this.cameraInspectsObject) {
            this.oldCameraPos = this.camera.position.clone()
            this.cameraInspectsObject = true
        }

        this._animating = true

        const that = this
        const position = nodeObj.o.position
        const target = new THREE.Vector3(
            position.x,
            position.y,
            Config.Controls.Camera.Animation.Z_DistanceWhenZoomed,
        )

        new TWEEN.Tween(this.camera.position)
            .to(target, Config.Controls.Camera.Animation.Duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(function () {
                that.camera.position.copy(this);
            })
            .onComplete(() => {
                that._animating = false
            })
            .start();
    }

    restoreCamera() {
        if (this.cameraInspectsObject) {
            this.cameraInspectsObject = false
            this._animating = true

            const that = this
            new TWEEN.Tween(this.camera.position)
                .to(this.oldCameraPos, Config.Controls.Camera.Animation.Duration)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(function () {
                    that.camera.position.copy(this);
                    that.camera.lookAt(that.center.x)
                })
                .onComplete(() => {
                    that._animating = false
                })
                .start();
        }
    }

    dispose() {
        this.controls.dispose()
    }
}