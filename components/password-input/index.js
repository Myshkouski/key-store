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
        // rules() {
        //     return [
        //         value => /^\d$/.test(value) || 'Digits only'
        //     ]
        // },

        password() {
            return this.keyArray.join('')
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
        onFocus(index) {
            // console.log('onFocus', index)
            this.keyArray.splice(index, 1, null)
            this.showValue.splice(index, 1, true)
        },

        onBlur(index) {
            // console.log('onBlur', index)
            if (this.keyArray[index]) {
                const timeout = setTimeout(this.hide.bind(this, index), ms(this.hideTimeout))
                this.show(index, timeout)
            } else {
                this.hide(index)
            }
        },

        show(index, value) {
            // console.log('show()', index, value)
            this.showValue.splice(index, 1, value || true)
        },

        hide(index) {
            // console.log('hide()', index)
            this.showValue.splice(index, 1, false)
        },

        async onInput(value, index) {
            // console.log('onInput()', value, index)

            this.$emit('input')
            this.keyArray.splice(index, 1, value % 10)

            this.focusNext(index)
        },

        onKeydown(event, index) {
            // console.log('onKeydown', arguments)

            if(event.key == 'Backspace') {
                this.keyArray.splice(index, 1, null)
                this.focusNext(index - 2)
            }
        },

        focusNext(index) {
            // console.log('focusNext', index)

            const { inputs } = this.$refs

            if (index + 1 < inputs.length) {
                inputs[index + 1].focus()
            } else if (index + 1 == inputs.length) {
                inputs[index].blur()
                this.$emit('change', this.password)
            }
        },

        // validate(value) {
        //     return /^\d+$/.test(value)
        // }
    }
}