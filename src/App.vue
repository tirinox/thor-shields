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
        return {}
    },
    computed: {},
    created() {
        document.title = 'THORViz'

    },
    methods: {}
}
</script>

<style>

@font-face {
    font-family: 'Norse';
    font-style: normal;
    font-weight: normal;
    src: local('Norse'), url('../public/fonts/Norse-KaWl.otf') format('opentype');
}

@font-face {
    font-family: 'Norse';
    font-style: normal;
    font-weight: bold;
    src: local('Norse-Bold'), url('../public/fonts/NorseBold-2Kge.otf') format('opentype');
}

html, body {
    margin: 0;
    height: 100%;
    font-family: 'Norse', monospace;
}

canvas {
    display: block;
}

</style>
