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

export default {
    name: 'ControlPanel',
    emits: ['mode-selected'],
    props: {
    },
    data() {
        return {
            selectedMode: NodeGroupModes.Normal
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
        }
    }
}

</script>

<style scoped>

.control-panel {
    position: absolute;
    bottom: 4px;
    right: 4px;
}

.button-selected {
    border-width: 2px;
    opacity: 1;
}

</style>
