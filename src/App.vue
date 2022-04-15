<template>
    <!--    <THORWorld msg="Hello"/>-->
    <ThreeTest></ThreeTest>
</template>

<script>
// import THORWorld from "@/components/THORWorld";
import ThreeTest from "@/components/ThreeTest";

export default {
    name: 'App',
    components: {
        ThreeTest,
        // THORWorld
    },
    data() {
        return {
        }
    },
    computed: {},
    created() {
        window.title = 'THORShields'
    },
    unmounted() {
    },
    methods: {
    }
}
</script>

<style>
html, body {
    margin: 0;
    height: 100%;
}

canvas {
    display: block;
}
</style>
