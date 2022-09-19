<template>
    <div class="container">
        <!-- 3D -->
        <div class="canvas-container">
            <canvas
                ref="canvas"
                class="canvas-full"
                tabindex="1"
                @keypress.prevent="onKeyDown"
                @mousemove="onMouseMove"
                @mouseenter="onMouseEnter"
                @mouseleave="onMouseLeave"
                @click.prevent="onClick"
            >
            </canvas>
            <FPSCounter
                v-show="showFps"
                ref="fps"
            >
            </FPSCounter>

            <LoadingIndicator v-if="isLoading"></LoadingIndicator>

            <ControlPanel @mode-selected="setSceneMode" v-if="fullyLoaded"></ControlPanel>
            <NewVersionPanel v-if="version.newDetected"
                             :old-version="version.oldVersion"
                             :new-version="version.newVersion"></NewVersionPanel>
        </div>

        <!-- UI -->
        <div class="ui-container">
            <keep-alive>
                <NodeDetailsWindow
                    v-if="nodeDetailsVisible"
                    :node="nodeToViewDetails"
                    :node-set="nodeSet"
                    :is-left="nodeDetailsIsLeft"
                    @close="onCloseDetails">
                </NodeDetailsWindow>
            </keep-alive>
        </div>
    </div>

</template>

<script>

import "@/css/common.css"
import * as THREE from "three"
import {Config} from "@/config";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import FPSCounter from "@/components/parts/FPSCounter";
import {MainScene} from "@/visual/MainScene";
import TWEEN from "tween.js";
import {Background} from "@/visual/helpers/Background";
import {emitter, EventTypes} from "@/helpers/EventTypes";
import ControlPanel from "@/components/parts/ControlPanel";
import NodeDetailsWindow from "@/components/NodeDetailsWindow";
import {NodeInfo} from "@/helpers/data/NodeInfo";
import {CameraController} from "@/visual/CameraController";
import LoadingIndicator from "@/components/parts/LoadingIndicator";
import _ from "lodash";
import {shallowRef} from "vue";
import {TrailTestScene} from "@/visual/TrailTestScene";
import {NodeObjTestScene} from "@/visual/NodeObjTestScene";
import {SoftwareVersionTracker} from "@/helpers/data/SoftwareVersion";
import NewVersionPanel from "@/components/parts/NewVersionPanel";

export default {
    name: 'MainScreen',
    components: {NewVersionPanel, LoadingIndicator, NodeDetailsWindow, ControlPanel, FPSCounter},
    props: {},

    data() {
        return {
            isLoading: true,

            showFps: Config.Debug.ShowFPS,

            mouseEnterX: 0,
            mouseEnterY: 0,

            tickCounter: 0,

            sceneMode: 'normal',

            fullyLoaded: false,

            nodeDetailsVisible: false,
            nodeDetailsIsLeft: true,
            nodeToViewDetails: new NodeInfo(),
            zoomedToNode: false,

            nodeSet: shallowRef(),

            version: {
                newDetected: false,
                oldVersion: '1',
                newVersion: '2',
            }
        }
    },

    methods: {
        onKeyDown(event) {
            if (event.code === 'KeyR') {
                this.cameraController.reset()
            } else if (event.code === 'KeyF') {
                this.showFps = !this.showFps
            } else if (event.code === 'KeyH') {
                console.log('help?')
            }
            // event.target.blur();
        },

        choseWindowSide(mouseEvent) {
            this.nodeDetailsIsLeft = !(mouseEvent.clientX < window.innerWidth * 0.5)
        },

        onMouseMove(event) {
            const x = event.clientX
            const y = event.clientY
            if (!this.mouseEnterX) {
                this.mouseEnterX = x
                this.mouseEnterY = y
                return
            }
            const scale = Config.Controls.Camera.MouseMoveStrength
            const dx = this.mouseEnterX - x
            const dy = this.mouseEnterY - y
            this.mouseEnterX = x
            this.mouseEnterY = y
            this.cameraController.controls.rotate(dx * scale, dy * scale)

            const pickIntersection = this._pickObject(event)
            if (pickIntersection) {
                const pickedName = pickIntersection?.object?.name
                this.content.nodeGroup.setElevatedNode(pickedName)

                this.choseWindowSide(event)

                if (!this.zoomedToNode) {
                    this.nodeDetailsVisible = !!pickedName
                    if (this.nodeDetailsVisible) {
                        this.nodeToViewDetails = this.content.findNodeByAddress(pickedName)
                    }
                }
            } else if (!this.zoomedToNode) {
                this.nodeDetailsVisible = false
                // this.nodeToViewDetails = this.content.findNodeByAddress(null)
            }
        },

        onMouseEnter(event) {
            this.mouseEnterX = event.clientX
            this.mouseEnterY = event.clientY
        },

        onMouseLeave() {
        },

        _pickObject(event, thoughtful = false) {
            if (!this.raycaster || !this.content.nodeGroup) {
                return null
            }

            const pickPosition = this.getCanvasRelativePosition(event)

            // cast a ray through the frustum
            this.raycaster.setFromCamera(pickPosition, this.cameraController.camera);
            // get the list of objects the ray intersected
            const intersectedObjects = this.raycaster.intersectObjects(this.content.nodeGroup.holder.children, true);
            if (thoughtful) {
                console.log('Objects hit by the ray caster: ' + intersectedObjects.length)
            }

            const namedObjects = _.filter(intersectedObjects, o => o.object.name && o.object.name !== '')
            return namedObjects.length ? namedObjects[0] : null
        },

        onClick(event) {
            const pickedObject = this._pickObject(event, true)
            if (pickedObject && pickedObject.object) {
                const nodeAddress = pickedObject.object.name
                if (nodeAddress && nodeAddress.startsWith('thor')) {
                    this.choseWindowSide(event)
                    this._onPickNodeObject(nodeAddress)
                }
            } else {
                this.nodeDetailsVisible = false
                this.zoomedToNode = false
                this.cameraController.restoreCamera()
            }
        },

        _onPickNodeObject(nodeAddress) {
            console.log('Picked node:', nodeAddress)
            this.content.pick(nodeAddress)

            this.nodeToViewDetails = this.content.findNodeByAddress(nodeAddress)
            this.nodeDetailsVisible = true

            const nodeObj = this.content.nodeGroup.getByName(nodeAddress)
            if (nodeObj) {
                this.zoomedToNode = true
                this.cameraController.cameraLookAtNode(nodeObj, this.content.nodeGroup.isCurrentModeFlat)
            }
        },

        getCanvasRelativePosition(event) {
            const rect = this.canvas.getBoundingClientRect()
            const pos = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            }
            return {
                x: (pos.x / this.canvas.clientWidth) * 2 - 1,
                y: -(pos.y / this.canvas.clientHeight) * 2 + 1
            }
        },

        resizeRendererToDisplaySize() {
            const renderer = this.renderer
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            const needResize = this.composer._width !== width || this.composer._height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
                if (this.bloomPass) {
                    this.bloomPass.setSize(width, height);
                }
                this.composer.setSize(width, height);
                if (this.bg) {
                    this.bg.setSize(width, height)
                }

                this.cameraController.onResize()
            }

            return needResize;
        },

        render() {
            // try {
            let delta = this.clock.getDelta();

            if (document.visibilityState === 'hidden') {
                return
            } else if (delta > 0.4) {
                delta = 0.01
            }

            this.resizeRendererToDisplaySize(this.renderer)
            TWEEN.update()
            if (this.$refs.fps) {
                this.$refs.fps.update(delta, this.scene)
            }
            this.cameraController.update(delta)
            this.content.update(delta)
            if (this.bg) {
                this.bg.update(delta)
            }
            this.composer.render(delta)
            // } catch (e) {
            //     console.error('Render error! ' + e)
            // }

            requestAnimationFrame(this.render);
        },

        makeSkybox() {
            if (Config.Scene.Background.Enabled) {
                // this.bg = new Background(this.scene)
                // this.bg = new BlackgroundStaticBox(this.scene, Config.Scene.Sky.SkyBox, Config.Scene.Sky.SkyBoxExt)
                this.bg = new Background(this.scene)
                this.bg.install()
            }
        },

        makeRenderer(canvas) {
            let renderer = this.renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: false,
                logarithmicDepthBuffer: Config.Renderer.LogZBuffer,
            });

            if (devicePixelRatio) {
                console.log(`Renderer: Setting devicePixelRatio = ${devicePixelRatio}.`)
                renderer.setPixelRatio(devicePixelRatio)
            }

            const renderScene = new RenderPass(this.scene, this.cameraController.camera);

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
            this.scene.add(this.cameraController.camera)
            this.makeSkybox()

            const mode = Config.Scene.DebugMode
            if (mode === 'nodeobj') {
                this.content = new NodeObjTestScene(this.scene, this.cameraController.camera)
            } else if (mode === 'trail') {
                this.content = new TrailTestScene(this.scene, this.cameraController.camera)
            } else {
                this.content = new MainScene(this.scene, this.cameraController.camera)
            }
        },

        setSceneMode(mode) {
            this.sceneMode = mode
            if (this.content.nodeGroup) {
                this.content.nodeGroup.mode = mode
            }
        },

        onFullyLoaded() {
            console.log('fully loaded! removing loading screen...')
            this.isLoading = false
            this.fullyLoaded = true
        },

        onDataArrived(nodeSet) {
            this.nodeSet = nodeSet
        },

        onCloseDetails() {
            this.zoomedToNode = false
            this.nodeDetailsVisible = false
            this.nodeToViewDetails = new NodeInfo()
            this.cameraController.restoreCamera()
        },

        onNewVersion(e) {
            this.version.newDetected = true
            this.version.oldVersion = e.oldVersion
            this.version.newVersion = e.newVersion
        }
    },

    mounted() {
        this.canvas = this.$refs.canvas

        this.clock = new THREE.Clock()
        this.scene = new THREE.Scene()

        this.cameraController = new CameraController(this.canvas)
        this.makeRenderer(this.canvas)
        this.resizeRendererToDisplaySize()
        this.buildScene()

        this.raycaster = new THREE.Raycaster()

        this.versionTracker = new SoftwareVersionTracker(emitter, Config.SoftwareVersion.Interval)
        if (Config.SoftwareVersion.Enabled) {
            this.versionTracker.run()
        }

        emitter.on(EventTypes.FullyLoaded, this.onFullyLoaded)
        emitter.on(EventTypes.DataSourceTick, this.onDataArrived)
        emitter.on(EventTypes.NewViewerVersion, this.onNewVersion)

        requestAnimationFrame(this.render);
    },

    unmounted() {
        this.versionTracker.stop()
        this.content.dispose()
        this.cameraController.dispose()
        emitter.off(EventTypes.FullyLoaded)
        emitter.off(EventTypes.DataSourceTick)
    }
}

</script>

<style>

.container {
    position: relative;
}

.canvas-container {
    position: absolute;
    z-index: 8;
}

.ui-container {
    position: absolute;
    z-index: 10;
}

.canvas-full {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
}

canvas {
}

*:focus {
    outline: none;
}

</style>
