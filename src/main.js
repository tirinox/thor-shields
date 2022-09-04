import {createApp} from 'vue'
import App from './App.vue'
import CameraControls from "camera-controls";

import * as THREE from 'three';
import {emitter} from "@/helpers/EventTypes";

CameraControls.install({THREE});

const app = createApp(App);
app.config.globalProperties.emitter = emitter;
app.mount('#app')
