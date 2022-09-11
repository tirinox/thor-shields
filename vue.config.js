const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,

    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.(glsl|vs|fs|frag|vert)$/,
                    use: 'raw-loader'
                }
            ]
        }
    },
    publicPath: '',
})
