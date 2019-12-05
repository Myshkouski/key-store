import {
    createCredentials,
    DERIVE_OPTIONS,
    AES_GCM_OPTIONS,
    generateSecretKey,
    _createPassphrase,
    generateKeyPair,
    unwrapSecretKey
} from '../lib/crypto'

import ms from 'ms'

export const state = () => ({
    secretKey: null,
    timeout: null
})

class Storage {
    constructor(storage) {
        this._storage = storage
    }

    import(map) {
        for (const [key, value] of map) {
            this.set(key, value)
        }

        return this
    }

    export(keys) {
        const map = new Map()
        for (const key of keys) {
            map.set(key, this.get(key))
        }

        return map
    }

    get(key) {
        return JSON.parse(this._storage.getItem(key))
    }

    set(key, value) {
        return this._storage.setItem(key, JSON.stringify(value))
    }
}

const ls = new Storage(window.localStorage)
const ss = new Storage(window.sessionStorage) 

export const mutations = {
    // passphrase(state, { salt, options }) {
    //     window.localStorage.setItem('passphrase/salt', JSON.stringify(btoa(salt)))
    //     window.localStorage.setItem('passphrase/options', JSON.stringify(options))
    // },

    // encryptedSecretKey(state, { encrypted, options }) {
    //     window.localStorage.setItem('secret-key/encrypted', JSON.stringify(encrypted))
    //     window.localStorage.setItem('secret-key/options', JSON.stringify(options))
    // },

    secretKey(state, secretKey) {
        state.secretKey = secretKey
    },

    timeout(state, timeout) {
        if (state.timeout) {
            clearTimeout(timeout)
        }

        state.timeout = timeout
    },

    clear(_state) {
        Object.assign(_state, state())
    }
}

export const getters = {
    salt() {
        const salt = atob(JSON.parse(window.localStorage.getItem('passphrase/salt')))
        return salt
    },

    encryptedSecretKey() {
        const encryptedSecretKey = new Uint8Array(atob(JSON.parse(window.localStorage.getItem('secret-key/encrypted'))).split('').map(char => char.charCodeAt(0)))
        return encryptedSecretKey.buffer
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
        const credentials = await createCredentials(password)
        ls.import(credentials)
    },

    async check({ getters }) {
        const { salt, encryptedSecretKey } = getters

        if (!salt || !encryptedSecretKey) {
            return false
        }

        return true
    },

    async importSecretKey({ commit }, { password, timeout }) {
        const credentials = ls.export(['password', 'passphrase', 'secret'])
        Object.assign(credentials.get('password'), { password })
        const secret = await unwrapSecretKey(credentials)

        if(timeout) {
            commit('timeout', setTimeout(commit.bind(null, 'clear'), ms(timeout)))
        }

        commit('secretKey', secret)
    }
}