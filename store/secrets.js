import Dexie from 'dexie'

let db, secretsTable, secretsCollection

if(process.browser) {
    db = new Dexie('main')
    db.version(1).stores({
        secrets: '++id,name,iv,secret,length'
    })

    secretsTable = db.table('secrets')
    secretsCollection = secretsTable.toCollection()
}

export const state = () => ({
    storedItems: []
})

export const getters = {
    encryptedPrivateKey() {
        return window.localStorage.getItem('private-key/encrypted')
    }
}

export const mutations = {
    flush(state, storedItems = []) {
        state.storedItems = storedItems
    },

    push(state, item) {
        state.storedItems.push(item)
    },

    update(state, item) {
        const { id } = item

        const index = state.storedItems.findIndex(item => item.id == id)

        if(~index) {
            state.storedItems.splice(index, 1, item)
        }
    }
}

export const actions = {
    async getPrimaryKeys() {
        return await secretsCollection.keys()
    },

    async import() {
        return await secretsTable.toArray()
    },

    async get(state, primaryKey) {
        return await secretsTable.get(primaryKey)
    },

    async create(store, { name, secret, iv }) {
        const item = await secretsTable.add({ name, secret, iv })
        store.commit('push', { name, secret, iv })
    },

    async update(store, { id, name, secret, iv }) {
        const item = await secretsTable.update(id, { name, secret, iv })
        store.commit('update', item)
    }
}