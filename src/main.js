import {createApp} from 'vue'
import App from './App.vue'
import mitt from 'mitt';
import CameraControls from "camera-controls";

import * as THREE from 'three';

CameraControls.install({THREE});

const emitter = mitt();
const app = createApp(App);
app.config.globalProperties.emitter = emitter;
app.mount('#app')