import { mapState, mapGetters } from 'vuex'
import { decrypt, encrypt, getRandomString } from '~/lib/crypto'

export default {
    props: ['item'],

    data() {
        return {
            password: null
        }
    },

    computed: {
        ...mapState('master-key', ['key']),
        ...mapGetters('secrets', ['encryptedPrivateKey', 'publicKey']),
        ...mapGetters('master-key', ['salt']),
        placeholder() {
            let placeholder = ''
            for(let i = this.item.length;i--;) {
                placeholder += '#'
            }
            return placeholder
        }
    },

    watch: {
        item: {
            deep: true,
            async handler(item) {
                if(!this.password && this.item.show) {
                    this.password = await this.decrypt(item.secret, item.iv)
                }
            }
        }
    },

    methods: {
        async decrypt(cipherText, iv) {
            if(this.key) {
                try {
                    return await decrypt(cipherText, iv, this.key)
                } catch(error) {
                    console.error(error)
                }
            }
        },

        async encrypt(password) {
            if(this.key) {
                const { cipherText, iv, secretKey } = await encrypt(password, { masterKey: this.key, salt: this.salt, privateKey: this.encryptedPrivateKey, publicKey: this.publicKey })
                this.$emit('update:password', { password: cipherText, iv, secretKey })
            }

        }
    },

    created() {
        this.$readyState = Promise.resolve()
    }
}