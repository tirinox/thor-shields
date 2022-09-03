<template>
    <div class="fps-counter">
        <span><strong>{{ Number(fps).toFixed(2) }}</strong> FPS, {{ objCount }} objects</span>
        <span class="activity" v-show="activityIndicator">•</span>
    </div>
</template>

<script>

import {countObjects} from "@/helpers/3D";
import {emitter, EventTypes} from "@/helpers/EventTypes";

export default {
    name: 'FPSCounter',
    props: {
        updatePeriod: {
            type: Number,
            default: 1.0
        }
    },
    data() {
        return {
            fps: 0.0,
            objCount: 0,
            activityIndicator: false,
            lastUpdateTime: 0.0
        }
    },
    methods: {
        pokeActivity() {
            this.activityIndicator = true
            setTimeout(() => {
                this.activityIndicator = false
            }, 100)
        },

        update(delta, scene) {
            if (delta > 0 && +Date.now() - this.updatePeriod * 1000 > this.lastUpdateTime) {
                this.fps = 1.0 / delta
                this.objCount = countObjects(scene)
                this.lastUpdateTime = +Date.now()
            }
        },
    },
    unmounted() {
        emitter.off(EventTypes.Activity, this.pokeActivity)
    },
    mounted() {
        emitter.on(EventTypes.Activity, this.pokeActivity)
    }
}

</script>

<style scoped>

.fps-counter {
    text-align: left;
    font-size: 14pt;
    color: whitesmoke;
    position: absolute;
    margin: 10px;
    left: 0;
    top: 0;
}
</style>