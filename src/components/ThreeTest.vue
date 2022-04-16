<template>
    <div class="canvas-holder">
        <canvas class="canvas-full" ref="canvas" tabindex="1" @keydown="onKeyDown"></canvas>
        <div class="fps-counter" v-show="showFps">
            <span><strong>{{ Number(fps).toFixed(2) }}</strong> FPS, {{ objCount }} objects</span>
        </div>
    </div>
</template>

<script>

import * as THREE from "three"
import {URLDataSource} from "@/helpers/URLDataSource";
import {Config} from "@/config";
import {NodeTracker} from "@/helpers/NodeTracker";
// import {getRandomInt} from "@/helpers/MathUtil";
import {NodeEvent} from "@/helpers/NodeEvent";
import {NodeGroup} from "@/visual/NodeGroup";


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

        render(time) {
            if (!this.lastCalledTime) {
                this.lastCalledTime = time;
                this.fps = 0;
            } else {
                const delta = (time - this.lastCalledTime) * 0.001;
                this.lastCalledTime = time;
                this.fps = 1.0 / delta
                this.nodeGroup.update(delta)
            }

            this.resizeRendererToDisplaySize(this.renderer);

            this.renderer.render(this.scene, this.camera)

            requestAnimationFrame(this.render);
        },

        createCamera() {
            this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight,
                0.001, 1000);
        },

        makeRenderer(canvas) {
            // Make renderer
            let renderer = this.renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: false
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

            const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
            this.scene.add( ambientLight );

            this.nodeGroup = new NodeGroup(this.scene)

            light.position.set(0, 10, 10)
            this.camera.position.z = 500

            // const no = new NodeObject()
            // no.o.position.copy(new Vector3(0, 0, 0))
            // this.scene.add(no.o)
        },

        handleData(nodes) {
            console.info('Handle Data tick!')
            this.prevNodes = this.nodes
            this.nodes = nodes
            const tracker = new NodeTracker(this.prevNodes, this.nodes)
            const events = tracker.extractEvents()

            for (const event of events) {
                if(event.node.node_address) {
                    if (event.type === NodeEvent.EVENT_TYPE.CREATE) {
                        this.nodeGroup.createNewNode(event.node)
                    } else if(event.type === NodeEvent.EVENT_TYPE.DESTROY) {
                        this.nodeGroup.destroyNode(event.node)
                    }
                }
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

        this.createCamera(this.canvas)
        this.makeRenderer(this.canvas)
        this.resizeRendererToDisplaySize()
        this.makeScene()
        requestAnimationFrame(this.render);

        this.dataSource = new URLDataSource(Config.DataSource.NodesURL, Config.DataSource.PollPeriod)
        this.dataSource.callback = (data) => {
            this.handleData(data)
        }
        this.dataSource.run()
    },

    unmounted() {
        this.dataSource.stop()
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
