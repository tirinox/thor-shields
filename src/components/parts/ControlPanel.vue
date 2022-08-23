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

.button-selected {
    border-width: 2px;
    opacity: 1;
}

.float-right {
    float: right;
}

</style>
