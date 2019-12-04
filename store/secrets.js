import Dexie from 'dexie'

const db = new Dexie('main')
db.version(1).stores({
    secrets: '++id,name,iv,secret,length'
})

const secretsTable = db.table('secrets')
const secretsCollection = secretsTable.toCollection()

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
    }
}

export const actions = {
    async getPrimaryKeys() {
        return await secretsCollection.keys()
    },

    async getAll() {
        return await secretsTable.toArray()
    },

    async get(state, primaryKey) {
        return await secretsTable.get(primaryKey)
    },

    async create(store, { name, secret, iv }) {
        const item = await secretsTable.add({ name, secret, iv })

        console.log('created', item)
        store.commit('push', { name, secret, iv })
    },

    async update(store, { id, name, secret, iv }) {
        const item = await secretsTable.update(id, { name, secret, iv })
        console.log('updated', item)
    }
}