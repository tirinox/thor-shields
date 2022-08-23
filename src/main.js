import {createApp} from 'vue'
import App from './App.vue'
import CameraControls from "camera-controls";

import * as THREE from 'three';
import {emitter} from "@/helpers/EventTypes";
import {fullRune, shortRune} from "@/helpers/MathUtil";

CameraControls.install({THREE});

const app = createApp(App);
app.config.globalProperties.emitter = emitter;
app.config.globalProperties.$filters = {
    shortRune,
    fullRune
}
app.mount('#app')
