<template lang="pug">
    v-content
        v-container
            p {{ keyArray }}
            p {{ showValue }}
            v-input(disabled)
            v-form
                div.inline-box
                    div.inline-input(
                        v-for="(value, index) in keyArray" 
                        :key="index"
                    )
                        v-text-field.number(
                            type="number"
                            pattern="[0-9]"
                            :autofocus="!index"
                            tabindex="0"
                            :placeholder="keyArray[index] ? mask : null"
                            :value="!showValue[index] ? null : keyArray[index]"
                            @input="onInput($event, index), toggleView(index)"
                            ref="inputs"
                            :autocomplete="false"
                            @focusout="onFocusout(index)"
                        )
                            //- template(slot="append-outer")
                                span {{ !showValue[index] }} {{ mask }} {{ keyArray[index] }}
                div
                    v-btn(ref="submit" tabindex="0" @click="onSubmit") Submit
</template>

<script>
    import ms from 'ms'

    export default {
        data() {
            const length = 6
            return {
                keyArray: new Array(length).fill(null),
                showValue: new Array(length).fill(null),
                mask: '\u2022',
                hideTimeout: '1s'
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
            // keyArray: {
            //     // immediate: true,
            //     async handler(value, old) {
            //         // console.log(value, old)
            //         await this.$nextTick()

            //         await new Promise(resolve => setTimeout(resolve, 500))

            //         for(let index in value) {
            //             if(!/^\d$/.test(value[index])) {
            //                 this.keyArray.splice(index, 1, '*')
            //             }
            //         }
            //         console.log(this.keyArray)
            //     }
            // }
        },

        methods: {
            async onInput(value, index) {
                const match = value.match(/\d$/)

                if(match) {
                    this.keyArray.splice(index, 1, match[0])

                    this.focus(index + 1)
                } else {
                    this.keyArray.splice(index, 1, null)
                    // this.focus(index)
                }                
            },

            toggleView(index) {
                if(this.showValue[index]) {
                    clearTimeout(this.showValue[index])
                }
                
                this.keyArray[index] && this.showValue.splice(index, 1, setTimeout(this.hide.bind(this, index), ms(this.hideTimeout)))
            },

            focus(index) {
                const { inputs, submit } = this.$refs
                if(index < inputs.length) {
                    inputs[index].focus()
                    const click = new Event('click')
                    inputs[index].$el.dispatch(click)
                } else {
                    submit.$el.focus()
                }
            },

            onFocusout(index) {
                return
                console.warn('onFocusout')
                if(this.showValue[index]) {
                    clearTimeout(this.showValue[index])
                }

                this.hide(index)
            },

            async hide(index) {
                console.warn('hide')
                await this.$nextTick()
                this.showValue.splice(index, 1, null)
            },

            validate(value) {
                return /^\d+$/.test(value)
            },

            async onSubmit() {
                const password = this.keyArray.join('')

                if (this.validate(password)) {
                    await this.$store.dispatch('credentials/init', { password })
                }
            }
        }
    }
</script>

<style lang="sass" scoped>
    .inline-box
        display: flex
        justify-content: space-evenly
    
    .inline-input
        max-width: 12.5%
    
    .number
        &::v-deep input
            flex-grow: 1
            height: auto
            max-height: none
            text-align: center
            font-size: 3rem

            /* Chrome, Safari, Edge, Opera */
            &::-webkit-outer-spin-button, &::-webkit-inner-spin-button
                -webkit-appearance: none
                margin: 0

            /* Firefox */
            &[type=number]
                -moz-appearance: textfield
</style>