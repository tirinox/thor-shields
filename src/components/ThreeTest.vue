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
        <div class="fps-counter" v-show="showFps">
            <span><strong>{{ Number(fps).toFixed(2) }}</strong> FPS, {{ objCount }} objects</span>
            <span class="activity" v-show="activityIndicator">•</span>
        </div>
    </div>
</template>

<script>

import * as THREE from "three"
import {URLDataSource} from "@/helpers/URLDataSource";
import {Config} from "@/config";
import {NodeTracker} from "@/helpers/NodeTracker";
import {NodeEvent} from "@/helpers/NodeEvent";
import {NodeGroup} from "@/visual/NodeGroup";
import {countObjects} from "@/helpers/3D";
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import CameraControls from "camera-controls";


export default {
    name: 'ThreeTest',
    components: {},
    props: {},

    data() {
        return {
            fps: 1.0,
            showFps: true,
            objCount: 0,

            nodes: [],
            prevNodes: [],
            activityIndicator: false,

            mouseEnterX: 0,
            mouseEnterY: 0,
        }
    },

    methods: {
        pokeActivity() {
            this.activityIndicator = true
            setTimeout(() => {
                this.activityIndicator = false
            }, 100)
        },

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
            const dx = this.mouseEnterX - x
            const dy = this.mouseEnterY - y
            console.log(dx, dy)
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
            }

            return needResize;
        },

        render() {
            const delta = this.clock.getDelta();
            this.controls.update(delta);

            if (delta > 0) {
                this.fps = 1.0 / delta
                this.nodeGroup.update(delta)
            }
            
            TWEEN.update()

            this.resizeRendererToDisplaySize(this.renderer);

            this.renderer.render(this.scene, this.camera)

            requestAnimationFrame(this.render);
        },

        createCamera() {
            this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
                0.001, 2000);
            // this.camera = new THREE.OrthographicCamera()
            this.camera.position.z = 1000

            const controls = this.controls = new CameraControls(this.camera, this.renderer.domElement);
            // controls.enabled = false
            controls.minDistance = 1000;
            controls.maxDistance = 1000;

            // controls.enableZoom = false
            // controls.enablePan = false
            //
            // controls.minAzimuthAngle = -10
            // controls.maxAzimuthAngle = 10
            //
            // controls.minPolarAngle = -20
            // controls.maxPolarAngle = 20

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
            // Make renderer
            let renderer = this.renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: false,
                logarithmicDepthBuffer: true,
            });

            if (devicePixelRatio) {
                console.log(`Renderer: Setting devicePixelRatio = ${devicePixelRatio}.`)
                renderer.setPixelRatio(devicePixelRatio)
            }
            renderer.autoClearColor = true;
        },

        makeScene() {
            const light = new THREE.DirectionalLight('hsl(0, 100%, 100%)')

            this.scene = new THREE.Scene();
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
                    } else if (event.type === NodeEvent.EVENT_TYPE.SLASH) {
                        this.nodeGroup.reactSlash(node)
                    } else if (event.type === NodeEvent.EVENT_TYPE.OBSERVE_CHAIN) {
                        this.nodeGroup.reactChain(node)
                    }
                }
            }

            if (events.length) {
                this.pokeActivity()
            }

            this.objCount = countObjects(this.scene)
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

        this.makeRenderer(this.canvas)
        this.createCamera(this.canvas)
        this.resizeRendererToDisplaySize()
        this.makeScene()

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

.fps-counter {
    text-align: left;
    font-size: 14pt;
    color: whitesmoke;
    position: absolute;
    margin: 10px;
    left: 0;
    top: 0;
}

.canvas-holder {
    width: 100%;
    height: 100%;
}

</style>
