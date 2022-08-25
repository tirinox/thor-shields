<template>
    <div class="loading-indicator">Loading.<span>{{ dots }}</span> </div>
</template>

<script>

export default {
    name: 'LoadingIndicator',
    data() {
        return {
            dots: ''
        }
    },
    methods: {
        tick() {
            this.dots += '.'
            if(this.dots.length >= 3) {
                this.dots = ''
            }
        }
    },
    mounted() {
        this.timer = setInterval(this.tick, 200.0)
    },
    beforeUnmount() {
        clearInterval(this.timer)
    }
}

</script>

<style scoped>
    .loading-indicator {
        position: absolute;
        left: 1rem;
        top: 1rem;
        font-size: 1.5rem;
        color: white;
    }
</style>