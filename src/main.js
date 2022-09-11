import {createApp} from 'vue'
import App from './App.vue'
import CameraControls from "camera-controls";
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

/* import specific icons */
import {faCopy, faArrowDownUpLock, faArrowRight} from '@fortawesome/free-solid-svg-icons'

import * as THREE from 'three';
import {emitter} from "@/helpers/EventTypes";

import { plugin as VueTippy } from 'vue-tippy'
import 'tippy.js/dist/tippy.css' // optional for styling
import 'tippy.js/themes/translucent.css'
import {isWebGL2Supported} from "webgl-detector";

if(!isWebGL2Supported()) {
    alert('WebGL is not supported!')
}

CameraControls.install({THREE});

/* add icons to the library */
library.add(faCopy, faArrowRight, faArrowDownUpLock)

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(VueTippy, {
    directive: "tippy", // => v-tippy
    component: 'tippy', // => <tippy/>
    flipDuration: 0,
    defaultProps: {
        placement: 'top'
    },
    popperOptions: {
        modifiers: {
            preventOverflow: {
                enabled: false
            }
        }
    }
})
app.config.globalProperties.emitter = emitter;
app.mount('#app')
