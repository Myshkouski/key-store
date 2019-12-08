<template lang="pug">
    v-content
        v-container
            v-form
                PasswordInput(
                    @input="password = null"
                    @change="onChange"
                )

            div
                v-btn(ref="submit" tabindex="0" @click="onSubmit") Submit
</template>

<script>
    import PasswordInput from '~/components/password-input'

    export default {
        components: {
            PasswordInput
        },

        data() {
            return {
                password: null
            }
        },

        methods: {
            onChange(password) {
                // console.log('onChange', arguments)

                this.password = password
                // this.changePassword(password)
            },

            onSubmit() {
                // console.log('onSubmit', arguments)

                this.password && this.changePassword(this.password)
            },

            async changePassword(password) {
                // console.log('changePassword', arguments)

                await this.$store.dispatch('credentials/init', { password })
            }
        }
    }
</script>