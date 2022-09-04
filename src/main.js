import {createApp} from 'vue'
import App from './App.vue'
import CameraControls from "camera-controls";
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

/* import specific icons */
import {faCopy} from '@fortawesome/free-solid-svg-icons'

import * as THREE from 'three';
import {emitter} from "@/helpers/EventTypes";

CameraControls.install({THREE});

/* add icons to the library */
library.add(faCopy)

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon)
app.config.globalProperties.emitter = emitter;
app.mount('#app')
