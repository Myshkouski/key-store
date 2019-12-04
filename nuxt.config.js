import dotenv from 'dotenv'

dotenv.config()

export default {
    build: {
        extend(config) {
            const ext = '.vue'
            const { extensions } = config.resolve
            const indexOfVue = extensions.indexOf(ext)

            if (~indexOfVue) {
                extensions.splice(indexOfVue, 1)
            }

            extensions.unshift(ext)
        }
    },
    
    buildModules: [
        // Simple usage
        // '@nuxtjs/vuetify',

        // With options
        ['@nuxtjs/vuetify', {
            treeShake: true
        }],
    ],

    generate: {
        dir: 'docs'
    }
}