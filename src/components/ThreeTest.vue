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
    </div>
</template>

<script>

import * as THREE from "three"
import {URLDataSource} from "@/helpers/URLDataSource";
import {Config} from "@/config";
import {NodeTracker} from "@/helpers/NodeTracker";
import {NodeEvent} from "@/helpers/NodeEvent";
import {NodeGroup} from "@/visual/NodeGroup";
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import CameraControls from "camera-controls";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import FPSCounter from "@/components/parts/FPSCounter";

export default {
    name: 'ThreeTest',
    components: {FPSCounter},
    props: {},

    data() {
        return {
            showFps: true,

            nodes: [],
            prevNodes: [],

            mouseEnterX: 0,
            mouseEnterY: 0,
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
            const delta = this.clock.getDelta();
            this.$refs.fps.update(delta, this.scene)
            this.controls.update(delta);
            this.nodeGroup.update(delta)
            TWEEN.update(delta)
            this.resizeRendererToDisplaySize(this.renderer);
            this.composer.render(delta)

            requestAnimationFrame(this.render);
        },

        createCamera() {
            this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
                0.001, 2000);
            // this.camera = new THREE.OrthographicCamera()
            this.camera.position.z = 1000
        },

        createCameraControl() {
            const controls = this.controls = new CameraControls(this.camera, this.renderer.domElement);
            const cfg = Config.Controls

            controls.minDistance = cfg.Distance
            controls.maxDistance = cfg.Distance

            controls.minAzimuthAngle = THREE.MathUtils.degToRad(-cfg.AzimuthAngleLimit)
            controls.maxAzimuthAngle = THREE.MathUtils.degToRad(cfg.AzimuthAngleLimit)

            controls.minPolarAngle = THREE.MathUtils.degToRad(-cfg.PolarAngleLimit + 90)
            controls.maxPolarAngle = THREE.MathUtils.degToRad(cfg.PolarAngleLimit + 90)

            controls.update(0)
        },

        makeSkybox() {
            const r = '/texture/skybox/star/';

            const urls = [
                r + 'right.png', r + 'left.png',
                r + 'top.png', r + 'bottom.png',
                r + 'back.png', r + 'front.png'
            ];

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
            const light = new THREE.DirectionalLight('hsl(0, 100%, 100%)')

            this.scene.add(this.camera)
            this.scene.add(light)

            const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
            this.scene.add(ambientLight);

            this.nodeGroup = new NodeGroup(this.scene)

            light.position.set(0, 10, 1000)

            this.makeSkybox()
        },

        handleData(nodes) {
            console.info('Handle Data tick!')

            this.prevNodes = this.nodes
            this.nodes = nodes
            const tracker = new NodeTracker(this.prevNodes, this.nodes)
            const events = tracker.extractEvents()

            for (const event of events) {
                const node = event.node
                if (node.node_address) {
                    if (event.type === NodeEvent.EVENT_TYPE.CREATE) {
                        this.nodeGroup.createNewNode(node)
                    } else if (event.type === NodeEvent.EVENT_TYPE.DESTROY) {
                        this.nodeGroup.destroyNode(node)
                    } else {
                        this.nodeGroup.reactEvent(event)
                    }
                }
            }

            if (events.length) {
                this.$refs.fps.pokeActivity()
            }
        },

    },

    mounted() {
        // if (!WEBGL.isWebGLAvailable()) {
        //     const warning = WEBGL.getWebGLErrorMessage();
        //     this.showFps = false
        //     document.getElementById('app').appendChild(warning);
        //     return
        // }

        this.canvas = this.$refs.canvas

        this.clock = new THREE.Clock()
        this.scene = new THREE.Scene()

        this.createCamera(this.canvas)
        this.makeRenderer(this.canvas)
        this.createCameraControl()
        this.resizeRendererToDisplaySize()
        this.buildScene()

        this.dataSource = new URLDataSource(Config.DataSource.NodesURL, Config.DataSource.PollPeriod)
        this.dataSource.callback = (data) => {
            this.handleData(data)
        }
        this.dataSource.run()

        requestAnimationFrame(this.render);
    },

    unmounted() {
        this.dataSource.stop()
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

</style>
