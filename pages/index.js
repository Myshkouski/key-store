import { mapState } from 'vuex'
import copy from 'clipboard-copy'
// import deepEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
// import ms from 'ms'

import {
    decrypt,
    encrypt,
    getRandomPassword
} from '~/lib/crypto'

import PasswordInput from '~/components/password-input'
// import Secret from '~/components/secret-text'
import ActionTooltip from '~/components/action-tooltip'

import headers from './headers.json'

export default {
    components: {
        // Secret,
        ActionTooltip,
        PasswordInput
    },

    data() {
        return {
            overlay: false,
            passwordMessage: null,
            snackbar: false,
            snackbarText: '',
            snackbarTimeout: 2000,
            selected: [],
            headers,
            newItem: null,
            itemToEdit: null
        }
    },

    computed: {
        ...mapState('credentials', ['secretKey']),
        ...mapState({
            storedItems: state => {
                return state.secrets.storedItems.map(item => {
                    return Object.assign({
                        decryptedSecret: null,
                        edit: false,
                        show: false
                    }, item)
                })
            }
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
        async copy(item) {
            await this.requestPassword()

            copy(await this.decrypt(item.secret, item.iv))

            this.snackbarText = 'Copied!'
            this.snackbar = true
        },
        getRandomPassword,
        async create(item) {
            console.log('create', arguments)

            await this.requestPassword()
            // name,iv,secret,length
            await this.$store.dispatch('secrets/create', { name, iv, secret, length: 0 })
        },

        async onPasswordInput(password) {
            try {
                await this.$store.dispatch('credentials/importSecretKey', {
                    password, timeout: '30s'
                })

                this.passwordMessage = 'Success!'

                this.$emit('password:ready')

                this.snackbarText = 'Success!'
                this.snackbar = true
                this.overlay = false
            } catch(error) {
                this.passwordMessage = error.message
            }
        },  
        
        async update(item) {
            // console.log('update', arguments)

            await this.requestPassword()

            const { id, name, decryptedSecret } = item
            const { cipherText: secret, iv } = await encrypt(decryptedSecret, this.secretKey)

            if(!id) {
                await this.$store.dispatch('secrets/create', { name, iv, secret, length: decryptedSecret.length })
            } else {
                await this.$store.dispatch('secrets/update', { id, name, iv, secret, length: decryptedSecret.length })
            }

            this.newItem = null
        },

        async toggle(item) {
            // console.log('toggle', item)
            item.show = !item.show

            if(item.show) {
                item.decryptedSecret = await this.decrypt(item.secret, item.iv, this.secretKey)
            } else {
                item.decryptedSecret = null
            }
        },

        async decrypt(cipherText, iv) {
            await this.requestPassword()

            try {
                return await decrypt(cipherText, iv, this.secretKey)
            } catch (error) {
                console.error(error)
            }
        },

        async requestPassword() {
            if (!this.secretKey) {
                this.overlay = true

                return new Promise((resolve, reject) => {
                    this.$on('password:ready', resolve)
                    this.$on('password:error', reject)
                })
            }
        }
    }
}