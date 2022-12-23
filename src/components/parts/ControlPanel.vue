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
import {capitalizeFirstLetter} from "@/helpers/String";

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
            if (value in NodeGroupModes) {
                this.selectedMode = value
                this.$emit('mode-selected', value)
                location.hash = value
            } else {
                console.error(`Unknown mode: ${value}`)
            }
        },

        setModeFromHash() {
            const hash = location.hash
            if (hash) {
                const modeName = capitalizeFirstLetter(hash.substring(1))
                this.setSceneMode(modeName)
            }
        }
    },
    mounted() {
        this.setModeFromHash()
    },
}

</script>

<style lang="scss" scoped>

.control-panel {
    position: absolute;
    bottom: 4px;
    right: 4px;
}

@media (min-device-width: 320px) and (max-device-width: 768px) {
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
