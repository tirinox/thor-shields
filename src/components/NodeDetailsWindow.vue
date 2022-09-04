<template>
    <Transition name="shrink">
        <div class="window" @keyup.esc.prevent="close" tabindex="0" ref="modal">
            <div class="close-button" @click="close"></div>
            <h1>Node details </h1>
            <h2>
                {{ node.address }}
                <div class="copy-button" @click="clipboard.writeText(node.address)">&#x2398;</div>
            </h2>

            <div class="prop-grid">
                <div class="prop-box">
                    <div class="category">Status:</div>
                    {{ statusEmoji }}
                    <span :class="nodeStatusClass">{{ node.status }}</span>
                </div>
                <div class="prop-box">
                    <div class="category">Since</div>
                    {{ statusSince }}
                </div>

                <div class="prop-box">
                    <div class="category">Version:</div>
                    {{ node.version }}
                </div>

                <div class="prop-box" v-if="hasIP">
                    <div class="category">IP:</div>
                    <a :href="ipAddressInfoLink" target="_blank">
                        {{ node.IPAddress }}
                    </a>
                </div>

                <div class="prop-box" v-if="hasIP">
                    <div class="category">Localtion:</div>
                    {{ node.IPInfo?.flag }}
                    {{ node.IPInfo?.country }},
                    {{ node.IPInfo?.city || 'unknown city' }}
                </div>

                <div class="prop-box" v-else>
                    <span>Unknown IP address</span>
                </div>

                <div class="prop-box">
                    <div class="category">🌐 Explorer:</div>
                    <a :href="`https://viewblock.io/thorchain/address/${node.address}`"
                       target="_blank">Viewblock – {{ node.shortAddress }}</a>
                </div>

                <div class="prop-box">
                    <div class="category">🔒 Bond:</div>
                    {{ nodeBond }}
                    <span>({{ nodeBondPercent }} %, #{{ nodeBondRank }})</span>
                </div>

                <div class="prop-box">
                    <div class="category">🏆 Awards:</div>
                    {{ award }}
                </div>

                <div class="prop-box">
                    <div class="category">😈 Slash points:</div>
                    {{ node.slashPoints }} pts.
                </div>

                <div class="prop-box" v-for="[chain, height] of Object.entries(node.observeChains)" :key="chain">
                    <div class="category">{{ chain }}</div>
                    <span :title="height" v-if="chainLag(chain)" class="chain-lag">
                        🩸 {{ chainLag(chain) }} behind!
                    </span>
                    <span v-else>
                        Up to date
                    </span>
                </div>
            </div>
        </div>
    </Transition>

</template>

<script>

import {NodeStatus} from "@/helpers/data/NodeTracker";
import {shortRune} from "@/helpers/MathUtil";

const STATUS_PROPS = {
    [NodeStatus.Active]: {
        emoji: '✅',
        class: 'status-active'
    },
    [NodeStatus.Standby]: {
        emoji: '⏳',
        class: 'status-standby',
    },
    [NodeStatus.Disabled]: {
        emoji: '🔴',
        class: 'status-disabled',
    },
    [NodeStatus.Whitelisted]: {
        emoji: '📄',
        class: 'status-whitelisted',
    },
}

export default {
    name: 'NodeDetailsWindow',
    emits: ['close'],
    props: [
        'node',
        'nodeSet'
    ],
    data() {
        return {}
    },
    computed: {
        hasIP() {
            return this.node.IPAddress && this.node.IPAddress !== ''
        },
        statusEmoji() {
            return STATUS_PROPS[this.node.status]?.emoji
        },
        nodeStatusClass() {
            return STATUS_PROPS[this.node.status]?.class
        },
        statusSince() {
            const timestamp = this.nodeSet.estimateTimestampAtBlock(this.node.statusSince)
            return (new Date(timestamp)).toISOString().slice(0, 10)
        },
        award() {
            return shortRune(Math.round(this.node.currentAward))
        },
        nodeBond() {
            return shortRune(Math.round(this.node.bond))
        },
        nodeBondRank() {
            return this.nodeSet.ranks.bond[this.node.address]
        },
        nodeBondPercent() {
            return this.nodeSet.bondPercentOfTotal(this.node.bond)
        },
        ipAddressInfoLink() {
            return `https://www.infobyip.com/ip-${this.node.IPAddress}.html`
        },
        chainLag() {
            return (chain) => this.nodeSet.topHeights[chain] - this.node.observeChains[chain]
        }
    },
    methods: {

        close() {
            this.$emit('close')
        }
    },
    mounted() {
        this.$refs.modal.focus()
    },
    // watch: {
    //     nodeSet(ns) {
    //         console.warn('node set changed', ns.ranks.bond)
    //     }
    // }
}

</script>

<style lang="scss">

// todo: different variant for Portrait orientation
.window {
    position: fixed;
    left: 5%;
    top: 50%;
    transform: translate(0%, -50%);

    border: 1px solid #097a7b;
    border-radius: 12px;

    background-color: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(8px);
    color: turquoise;
    padding: 20px;

    max-width: 50vw;

    font-size: 10pt;
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
    //font-weight: bolder;
    color: white;
    font-size: 7pt;
}

.value {
    font-family: EXO2, monospace;
    font-size: 8pt;
}

.prop-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 4px;
    color: white;
    //font-size: 7pt;
}

.prop-box {
    background-color: rgba(1, 0, 0, 0.5);
    color: turquoise;
    border-radius: 5px;
    padding: 6px;
    font-size: 150%;
    border: 1px dashed #16504a;
}

.status-standby {
    color: #b4b4b4;
}

.status-disabled {
    color: red;
}

.status-active {
    color: #9cffb2;
}

.status-whitelisted {
    color: white;
}

.chain-lag {
    color: orangered;
}

.copy-button {
    display: inline-block;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    padding: 4px;
    width: 20px;
    font-size: 20pt;
    cursor: copy;
}

</style>
