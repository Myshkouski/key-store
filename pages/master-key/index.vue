<template lang="pug">
    v-content
        v-container
            p {{ keyArray }}
            v-input(disabled)
            v-form.inline-box(@input="this.validate")
                div(
                    v-for="(value, index) in keyArray" 
                    :key="index"
                )
                    v-text-field(
                        type="text"
                        :autofocus="!index"
                        :value="keyArray[index]"
                    )
</template>

<script>
    export default {
        data() {
            const length = 6
            return {
                keyArray: new Array(length).fill('*'),
            }
        },

        computed: {
            rules() {
                return [
                    value => /^\d$/.test(value) || 'Digits only'
                ]
            }
        },

        watch: {
            keyArray: {
                // immediate: true,
                async handler(value, old) {
                    console.log(value, old)
                    // await this.$nextTick()

                    for(let index in value) {
                        if(!/^\d$/.test(value[index])) {
                            // this.keyArray.splice(index, 1, '*')
                        }
                    }
                }
            }
        },

        methods: {
            onInput(event, index) {
                // console.log(event)
                // if(/^\d$/.test(event.key)) {
                //     event.preventDefault()
                //     event.target.value = event.key
                //     this.keyArray.splice(index, 1, event.key)
                // }
            },

            validate(value) {
                return /^\d$/.test(value)
            }
        }
    }
</script>

<style lang="sass" scoped>
    .inline-box
        display: flex
</style>