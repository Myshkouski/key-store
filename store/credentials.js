import { _createPassphrase, generateKeyPair } from '../lib/crypto'

export const state = () => ({
    key: null
})

export const mutations = {
    setKey(state, key) {
        state.key = key
    },
}

export const getters = {
    salt() {
        return JSON.parse(window.localStorage.getItem('passphrase/salt'))
    },

    publicKey() {
        return JSON.parse(window.localStorage.getItem('public-key'))
    },

    privateKey() {
        return JSON.parse(window.localStorage.getItem('private-key/encrypted'))
    }
} 

export const actions = {
    async setMasterKey(store, password) {
        const storedSalt = store.getters.salt
        
        const { key, salt } = await _createMasterKey(password, storedSalt)
        const hash = ''

        window.localStorage.setItem('master-key/salt', salt)
        window.localStorage.setItem('master-key/hash', hash)
    },

    async clear() {
        // window.localStorage.removeItem('passprase/salt')
        // window.localStorage.removeItem('passphrase/hash')
        // window.localStorage.removeItem('passphrase/alg')
    
        
    },

    async isConsistent() {},

    async init({}, { password }) {
        const { passphrase, salt } = await _createPassphrase(password)
        const { publicKey, privateKey } = await generateKeyPair()
        const encryptedPrivateKey = await privateKey.wrap(passphrase)

        window.localStorage.setItem('public-key', JSON.stringify(await publicKey.export('raw')))
        window.localStorage.setItem('private-key/encrypted', JSON.stringify(await encryptedPrivateKey.export('raw')))
        window.localStorage.setItem('passphrase/salt', JSON.stringify(salt))
    
        return { salt, publicKey, encryptedPrivateKey }
    },

    async check() {

    }
}