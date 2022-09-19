<template>
    <div class="panel">
        <div>The website update!</div>
        <div class="details">
            <span class="old-version">{{ oldVersion }}</span>
            <font-awesome-icon icon="fa-solid fa-arrow-right" />
            <span class="new-version">{{ newVersion }}</span>
            <button @click="reload" class="reload-button">
                Reload the page
                <font-awesome-icon icon="fa-solid fa-rotate-right" />
            </button>
        </div>
    </div>
</template>

<script>

export default {
    name: 'NewVersionPanel',
    props: [
        'newVersion', 'oldVersion'
    ],
    data() {
        return {
        }
    },
    methods: {
        reload() {
            document.location.reload(true)
        }
    },
    mounted() {
    },
    beforeUnmount() {
    }
}

</script>

<style scoped>
.panel {
    border-radius: 5px;
    border: 1px solid #097a7b;
    background: black;
    color: turquoise;
    padding: 10px;
    font-size: 16pt;
    position: absolute;
    top: 10px;
    left: 10px;
}

.details {
    font-size: 13pt;
}

.reload-button {
    border-color: #ffd278;
    color: #ffd278;
}

.old-version {
    margin-right: 5pt;
    color: #aaa;
}

.new-version {
    margin-left: 5pt;
}

</style>