import { mapState } from 'vuex'
import copy from 'clipboard-copy'
// import deepEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import {
    encrypt,
    _decrypt,
    createMasterKey,
    getRandomString
} from '~/lib/crypto'

import Secret from '~/components/secret-text'
import ActionTooltip from '~/components/action-tooltip'

export default {
    components: {
        Secret,
        ActionTooltip
    },

    data() {
        return {
            snackbar: false,
            snackbarTimeout: 2000,
            selected: [],
            headers: [
                {
                    text: 'Name',
                    align: 'left',
                    sortable: true,
                    value: 'name'
                },
                {
                    text: 'Secret',
                    align: 'left',
                    sortable: false,
                    value: 'secret'
                },
                {
                    text: 'Actions',
                    align: 'left',
                    sortable: false,
                    value: 'actions'
                }
            ],
            newItem: null,
            itemToEdit: null
        }
    },

    computed: {
        ...mapState({
            storedItems: state => state.secrets.storedItems.map(item => Object.assign({ edit: false, show: false }, item))
        }),

        items() {
            const items = Array.from(this.storedItems)

            if (this.newItem) {
                items.unshift(this.newItem)
            }

            return items
        }
    },

    methods: {
        // deepEqual,
        cloneDeep,
        copy,
        getRandomString,
        async create(item) {
            // name,iv,secret,length
            await this.$store.dispatch('secrets/create', { name, iv, secret, length: 0 })
        },
        
        async update(item) {
            const { id, name, iv, secret } = item

            if(!id) {
                await this.$store.dispatch('secrets/create', { name, iv, secret, length: 0 })
            } else {
                await this.$store.dispatch('secrets/update', { id, name, iv, secret, length: 0 })
            }

            this.newItem = null
        }
    },

    async mounted() {
        // const password = '01091996'
        // const masterKey = await createMasterKey(password)
        // const encrypted = await encrypt('some-text', {
        //     masterKey,
        //     salt: getRandomString(16)
        // })

        // console.log(encrypted)
    }
}