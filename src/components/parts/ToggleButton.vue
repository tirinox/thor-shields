<template>
    <button @click="toggle" :class="{'button-selected': isEnabled}">
        <span v-if="isEnabled">✓</span>
        <slot></slot>
    </button>
</template>

<script>

export default {
    name: 'ToggleButton',
    emits: ['input'],
    prop: ['value'],
    data () {
        return {
            isEnabled: this.value
        }
    },
    methods: {
        toggle() {
            this.isEnabled = !this.isEnabled
            this.$emit('input', this.isEnabled)
        }
    },
}

</script>

<style lang="scss">

.button-selected {
    border-width: 2px;
    opacity: 1;
}

</style>
