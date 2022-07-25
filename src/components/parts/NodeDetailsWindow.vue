<template>

    <div class="window" :class="{'visible': visible}">
        <div class="close-button" @click="close"></div>
        <h1>Node details </h1>
        <h2>{{ node.address }}</h2>
        <p>
            <span v-if="node.IPAddress && node.IPAddress !== ''">
                <a :href="`https://www.infobyip.com/ip-${node.IPAddress}.html`">
                    {{ node.flag }} IP Address information {{ node.IPAddress }}
                </a>
            </span>
            <span v-else>
                No IP address
            </span>
            <br>
            <a :href="`https://viewblock.io/thorchain/address/${node.address}`">Viewblock Node address</a>
            <br>
            <span>
                <strong>Bond:</strong>
                {{ Math.round(node.bond) }} Rune
            </span>
            <br>
            <span>
                <strong>Awards:</strong>
                {{ Math.round(node.currentAward) }} Rune
            </span>
            <br>
            <span>
                <strong>Slash points:</strong>
                {{ node.slashPoints }} pts.
            </span>
        </p>
    </div>

</template>

<script>

export default {
    name: 'NodeDetailsWindow',
    emits: ['close'],
    props: [
        'node',
        'visible'
    ],
    data() {
        return {}
    },
    computed: {},
    methods: {
        close() {
            this.$emit('close')
        }
    },
}

</script>

<style lang="scss">

.window {
    border: 1px solid darkturquoise;
    border-radius: 12px;
    position: absolute;
    width: 60vw;
    height: auto;
    float: left;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(8px);
    color: turquoise;
    padding: 20px;
    display: none;
}

.visible {
    display: block;
}

.close-button {
    float: right;
    overflow: hidden;
    position: relative;
    border: none;
    padding: 0;
    width: 2em;
    height: 2em;
    border-radius: 50%;
    background: transparent;
    color: turquoise;
    font: inherit;
    text-indent: 100%;
    cursor: pointer;

    &:focus {
        outline: solid 0 transparent;
        box-shadow: 0 0 0 2px #8ed0f9
    }

    &:hover {
        background: rgba(29, 161, 142, .1)
    }

    &:before, &:after {
        position: absolute;
        top: 15%;
        left: calc(50% - .0625em);
        width: .125em;
        height: 70%;
        border-radius: .125em;
        transform: rotate(45deg);
        background: currentcolor;
        content: ''
    }

    &:after {
        transform: rotate(-45deg);
    }
}

</style>
