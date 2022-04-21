<template>
    <!--    <THORWorld msg="Hello"/>-->
    <MainScreen></MainScreen>
</template>

<script>
// import THORWorld from "@/components/THORWorld";
import MainScreen from "@/components/MainScreen";
import {preloadFont} from "troika-three-text";
import {Config} from "@/config";
import {IPAddressInfoLoader} from "@/helpers/data/IPAddressInfo";

export default {
    name: 'App',
    components: {
        MainScreen,
        // THORWorld
    },
    data() {
        return {}
    },
    computed: {},
    created() {
        document.title = 'THORViz'
        this.preloading()
    },
    methods: {
        preloading() {
            preloadFont(
                {
                    font: Config.Font.Main,
                    characters: 'abcdefghijklmnopqrstuvwxyz1234567890'
                },
                () => {
                    console.log('font loading done')
                }
            )
        }
    }
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

@font-face {
    font-family: 'EXO2';
    src: url('../public/fonts/Exo2-VariableFont_wght.ttf') format('truetype');
}

html, body {
    margin: 0;
    height: 100%;
    font-family: 'EXO2', monospace;
}

canvas {
    display: block;
}

</style>
