<template>
    <Transition name="shrink">
        <div class="window" v-if="visible" @keydown.esc="close" tabindex="0">
            <div class="close-button" @click="close"></div>
            <h1>Node details </h1>
            <h2>{{ node.address }}</h2>

            <h4>
                {{ statusEmoji }} <span class="category">Status: </span>
                {{ node.status }}
            </h4>

            <div v-if="node.IPAddress && node.IPAddress !== ''">

                <span class="category">IP Address information:</span>
                <span>
                    <a :href="`https://www.infobyip.com/ip-${node.IPAddress}.html`" target="_blank">
                        {{ node.IPInfo?.flag }} {{ node.IPAddress }}
                    </a>
                </span>

                <br>

                <span class="category">
                    Location:
                </span>
                <span>
                    {{ node.IPInfo?.countryCode }}, {{ node.IPInfo?.city || 'unknown city' }}
                </span>

            </div>
            <div v-else>
                <code>No IP address</code>
            </div>

            <br>

            <span>
                <span class="category">🌐 Explorer:</span>
                 <a :href="`https://viewblock.io/thorchain/address/${node.address}`" target="_blank">
                     Viewblock {{ node.shortAddress }}</a>
            </span>

            <br>
            <span>
                <span class="category">🔒 Bond:</span>
                {{ $filters.fullRune(Math.round(node.bond)) }}
            </span>
            <br>
            <span>
                <span class="category">🏆 Awards:</span>
                {{ $filters.fullRune(Math.round(node.currentAward)) }}
            </span>
            <br>
            <span>
                <span class="category">😈 Slash points:</span>
                {{ node.slashPoints }} pts.
            </span>

        </div>
    </Transition>

</template>

<script>

import {NodeStatus} from "@/helpers/NodeTracker";

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
    computed: {
        statusEmoji() {
            const st = this.node.status
            if (st === NodeStatus.Active) {
                return '✅'
            } else if (st === NodeStatus.Standby) {
                return '⏳'
            } else if (st === NodeStatus.Whitelisted) {
                return '📄'
            } else if (st === NodeStatus.Disabled) {
                return '🔴'
            }
            return ''
        },
    },
    methods: {
        close() {
            this.$emit('close')
        }
    },
    watch: {
        visible(n) {
            console.log('visible = ', n)
        }
    }
}

</script>

<style lang="scss">

// todo: different variant for Portrait orientation
.window {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    border: 1px solid #097a7b;
    border-radius: 12px;

    background-color: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(8px);
    color: turquoise;
    padding: 20px;

    font-size: 10pt;
}

.visible {
    display: flex;
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

h1 {
    margin: 0;
    padding: 0;
    color: white;
}

.category {
    font-family: EXO2, monospace;
    font-weight: bolder;
    color: white;
}

</style>
