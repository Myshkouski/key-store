import copy from 'clipboard-copy'

export default {
    data() {
        return {
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
                }
            ],
            items: [
                {
                    id: 1,
                    name: 'mpi',
                    secret: 'hello',
                    show: false
                }
            ]
        }
    },

    methods: {
        copy
    }
}