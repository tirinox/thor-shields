<template>
    <div class="control-panel">
        <button @click="setSceneMode(mode.value)"
                :class="isButtonSelectedClass(mode.value)"
                v-for="mode in modes" :key="mode.value">
            {{ mode.text }}
        </button>
    </div>
</template>

<script>

import {NodeGroupModes} from "@/visual/NodeGroup";
import {Config} from "@/config";

export default {
    name: 'ControlPanel',
    components: {},
    emits: ['mode-selected'],
    props: {},
    data() {
        return {
            selectedMode: NodeGroupModes.Normal,
            activeOnly: false,
        }
    },
    computed: {
        modes() {
            return [
                {value: NodeGroupModes.Normal, text: 'NORMAL'},
                {value: NodeGroupModes.Status, text: 'STATUS'},
                {value: NodeGroupModes.Provider, text: 'PROVIDER'},
                {value: NodeGroupModes.Version, text: 'VERSION'},
                {value: NodeGroupModes.Bond, text: 'BOND'},
                {value: NodeGroupModes.Geo, text: 'GEO'},
            ]
        }
    },
    methods: {
        isButtonSelectedClass(modeName) {
            return {
                'button-selected': this.selectedMode === modeName
            }
        },

        setSceneMode(value) {
            this.selectedMode = value
            this.$emit('mode-selected', value)
        },
    },
    mounted() {
        if(Config.Scene.InitialMode && Config.Scene.InitialMode !== NodeGroupModes.Normal) {
            setTimeout(() => this.setSceneMode(Config.Scene.InitialMode), 1000.0)
        }
    }
}

</script>

<style lang="scss" scoped>

.control-panel {
    position: absolute;
    bottom: 4px;
    right: 4px;
}

@media (min-device-width:320px) and (max-device-width:768px) {
    .control-panel {
        bottom: 60px;
    }
}

.button-selected {
    border-width: 2px;
    opacity: 1;
}

.float-right {
    float: right;
}

</style>
