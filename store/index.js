
export const plugins = process.browser ? [
    async store => {
            const load = async () => {
                store.commit('secrets/flush', await store.dispatch('secrets/import'))
            }

            // store.subscribeAction({
            //     after: async action => {
            //         if (action == 'secrets/create') {
            //             await load()
            //         }
            //     }
            // })

            await load()
        },

        async store => {
            if (!(await store.dispatch('credentials/check'))) {
                // await store.dispatch('credentials/init', {
                //     password: '140896'
                // })
            }
        }
] : []