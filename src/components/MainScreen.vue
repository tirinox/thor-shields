<template>
    <div class="canvas-holder">
        <canvas
            class="canvas-full"
            ref="canvas"
            tabindex="1"
            @keydown="onKeyDown"
            @mousemove="onMouseMove"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave">
        </canvas>
        <FPSCounter
            v-show="showFps"
            ref="fps"
        >
        </FPSCounter>
        <div class="control-panel">
            <button @click="setSceneMode('normal')">NORMAL</button>
            <button @click="setSceneMode('status')">STATUS</button>
            <button @click="setSceneMode('provider')">PROVIDER</button>
            <button @click="setSceneMode('bond')">BOND</button>
        </div>
    </div>
</template>

<script>

import "@/css/common.css"
import * as THREE from "three"
import {Config} from "@/config";
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import CameraControls from "camera-controls";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import FPSCounter from "@/components/parts/FPSCounter";
import {MainScene} from "@/visual/MainScene";
import _ from "lodash";
// import {TrailTestScene} from "@/visual/TrailTestScene";

export default {
    name: 'MainScreen',
    components: {FPSCounter},
    props: {},

    data() {
        return {
            showFps: true,

            nodes: [],
            prevNodes: [],

            mouseEnterX: 0,
            mouseEnterY: 0,

            sceneMode: 'normal',
        }
    },

    methods: {
        onKeyDown(event) {
            if (event.code === 'KeyR') {
                this.resetCamera()
            } else if (event.code === 'KeyD') {
                this.showFps = !this.showFps
            } else if (event.code === 'KeyH') {
                console.log('help?')
            }
        },

        onMouseMove(event) {
            const x = event.clientX
            const y = event.clientY
            if (!this.mouseEnterX) {
                this.mouseEnterX = x
                this.mouseEnterY = y
                return
            }
            const scale = 0.0005
            const dx = this.mouseEnterX - x
            const dy = this.mouseEnterY - y
            this.mouseEnterX = x
            this.mouseEnterY = y
            this.controls.rotate(dx * scale, dy * scale)
        },

        onMouseEnter(event) {
            this.mouseEnterX = event.clientX
            this.mouseEnterY = event.clientY
        },

        onMouseLeave() {
        },

        resetCamera() {
            this.controls.reset()
        },

        resizeRendererToDisplaySize() {
            const renderer = this.renderer
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
                if (this.bloomPass) {
                    this.bloomPass.setSize(width, height);
                }
                this.composer.setSize(width, height);
            }

            return needResize;
        },

        render() {
            this.resizeRendererToDisplaySize(this.renderer)

            const delta = this.clock.getDelta();
            this.$refs.fps.update(delta, this.scene)
            this.controls.update(delta);
            this.content.update(delta)

            TWEEN.update(delta)

            this.composer.render(delta)

            requestAnimationFrame(this.render);
        },

        createCamera() {
            this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
                0.001, Config.Controls.Camera.Distance.Max * 2);
            // this.camera = new THREE.OrthographicCamera()
            this.camera.position.z = Config.Controls.Camera.Distance.Start
        },

        createCameraControl() {
            const controls = this.controls = new CameraControls(this.camera, this.renderer.domElement);
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
        },

        makeSkybox() {
            const baseURL = Config.Scene.Sky.SkyBox

            const urls = _.map([
                'right.png', 'left.png',
                'top.png', 'bottom.png',
                'back.png', 'front.png'
            ], (name) => `${baseURL}/${name}`);

            this.scene.background = new THREE.CubeTextureLoader().load(urls)
        },

        makeRenderer(canvas) {
            let renderer = this.renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: false,
                logarithmicDepthBuffer: true,
            });

            if (devicePixelRatio) {
                console.log(`Renderer: Setting devicePixelRatio = ${devicePixelRatio}.`)
                renderer.setPixelRatio(devicePixelRatio)
            }

            const renderScene = new RenderPass(this.scene, this.camera);

            this.composer = new EffectComposer(renderer);
            this.composer.addPass(renderScene);

            const bloomCfg = Config.Effects.Bloom
            if (bloomCfg.Enabled) {
                this.bloomPass = new UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth, window.innerHeight),
                    bloomCfg.Strength,
                    bloomCfg.Radius,
                    bloomCfg.Threshold)
                this.composer.addPass(this.bloomPass);
            }
        },

        buildScene() {
            this.scene.add(this.camera)
            this.makeSkybox()

            this.content = new MainScene(this.scene, this)
            // this.content = new TrailTestScene(this.scene, this)
        },

        setSceneMode(mode) {
            this.sceneMode = mode
            if(this.content.nodeGroup) {
                this.content.nodeGroup.mode = mode
            }
        }
    },

    mounted() {
        this.canvas = this.$refs.canvas

        this.clock = new THREE.Clock()
        this.scene = new THREE.Scene()

        this.createCamera(this.canvas)
        this.makeRenderer(this.canvas)
        this.createCameraControl()
        this.resizeRendererToDisplaySize()
        this.buildScene()

        requestAnimationFrame(this.render);
    },

    unmounted() {
        this.content.dispose()
        this.controls.dispose()
    }
}

</script>

<style>

.canvas-full {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    outline: none;
}

.canvas-holder {
    width: 100%;
    height: 100%;
}

.control-panel {
    position: absolute;
    bottom: 4px;
    right: 4px;
}

</style>
