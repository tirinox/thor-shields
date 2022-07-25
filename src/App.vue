<template>
    <MainScreen></MainScreen>
</template>

<script>
import MainScreen from "@/components/MainScreen";
import {preloadFont} from "troika-three-text";
import {Config} from "@/config";

export default {
    name: 'App',
    components: {
        MainScreen,
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

@supports(padding:max(0px)) {
    body, header, footer {
        padding-left: min(0vmin, env(safe-area-inset-left));
        padding-right: min(0vmin, env(safe-area-inset-right));
    }
}

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: 'EXO2', monospace;
    background: black;
    color: turquoise;
}

</style>
