import dotenv from 'dotenv'

dotenv.config()

export default {
    build: {
        parallel: true,
        // cache: true,
        // optimizeCSS: true,
        extractCSS: true,
        extend(config) {
            const ext = '.vue'
            const {
                extensions
            } = config.resolve
            const indexOfVue = extensions.indexOf(ext)

            if (~indexOfVue) {
                extensions.splice(indexOfVue, 1)
            }

            extensions.unshift(ext)
        }
    },

    buildModules: [
        ['@nuxtjs/vuetify', { treeShake: true }],
    ],

    modules: [
        ['@nuxtjs/pwa', { icon: true }]
    ],

    generate: {
        dir: 'docs'
    },

    manifest: {
        name: 'Key Store',
        short_name: 'Key Store',
        description: 'Keep secured passwords in browser',
        display: 'standalone',
        viewport: 'width=device-width, initial-scale=1'
    },

    pwa: {
        workbox: {
            dev: process.env.NODE_ENV === 'development',
            runtimeCaching: [{
                urlPattern: '.*',
                cacheName: 'app-cache',
                handler: 'cacheFirst',
                method: 'GET',
                strategyOptions: {
                    cacheableResponse: {
                        statuses: [0, 200]
                    }
                }
            }]
        },

        icon: {
            iconFileName: 'icon.png'
        }
    }
}