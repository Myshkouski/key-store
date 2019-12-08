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
        ...mapState('credentials', ['secretKey']),
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
        },

        // password(password) {
        //     if(password) {
        //         this.encrypt(password)
        //     }
        // },

        secretKey(value) {
            if(value) {
                this.$emit('secret-key:imported')
            }
        }
    },

    methods: {
        async decrypt(cipherText, iv) {
            if (!this.secretKey) {
                await this.waitForPassword()
            }

            try {
                return await decrypt(cipherText, iv, this.secretKey)
            } catch (error) {
                console.error(error)
            }
        },

        async encrypt(password) {
            if (!this.secretKey) {
                await this.waitForPassword()
            }

            const { cipherText, iv } = await encrypt(password, this.secretKey)
            
            this.$emit('update:password', { password: cipherText, iv })
        },

        async waitForPassword() {
            this.$emit('update:need-key')
            
            return new Promise((resolve, reject) => {
                this.$on('secret-key:imported', resolve)
            })
        }
    },

    created() {
        this.$readyState = Promise.resolve()
    }
}