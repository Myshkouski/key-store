const encode = string => new Uint8Array(Array.from(string).map(char => char.charCodeAt(0)))
const decode = buffer => String.fromCodePoint(...Array.from(new Uint8Array(buffer)))

// base64 string -> uint8array
const toBuffer = string => new Uint8Array(encoder.encode(atob(string)))
// uint8array -> base64 string
const toBase64 = array => btoa(decoder.decode(new Uint8Array(array)))
// const isBase64 = string => /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(string)

let subtle = window.crypto.subtle

if(!subtle) {
    let SubtleConstructor
    if (global.SubtleCrypto) {
        SubtleConstructor = SubtleCrypto
    } else if (global.Crypto) {
        SubtleConstructor = Crypto
    }
    if (SubtleConstructor) {
        subtle = Object.create(SubtleConstructor.prototype, {})
    }
}

if (!subtle) {
    throw new ReferenceError(`Crypto API is unsupported on the device`)
}

const _createDict = ranges => {
    const dict = []

    for (let range of ranges) {
        for (let i = range[0]; i <= range[1]; ++i) {
            dict.push(i)
        }
    }

    return new Uint8Array(dict)
}

const numbersRange = new Uint8Array([0x30, 0x39])
const upperCaseLetters = new Uint8Array([0x41, 0x5a])
const lowerCaseLetters = new Uint8Array([0x61, 0x7a])
const saveDict = _createDict([
    numbersRange,
    upperCaseLetters,
    lowerCaseLetters
])
const letterDict = _createDict([
    upperCaseLetters,
    lowerCaseLetters
])
const extendedDict = _createDict([
    new Uint8Array([0x21, 0x7e])
])


const _getRandomBuffer = (length = 32, dict = null) => {
    let array = window.crypto.getRandomValues(new Uint8Array(length))
    
    if(dict) {
        array = array.map(n => dict[n % dict.length])
    }
    
    return array.buffer
}

export const getRandomBuffer = length => _getRandomBuffer(length)

export const getRandomLetterString = length => decode(_getRandomBuffer(length, letterDict))
export const getRandomString = (length = 32, encoding = 'utf8', save = false) => {
    const buffer = _getRandomBuffer(length, save ? saveDict : null)
    const string = decode(buffer)

    if(encoding == 'hex') {
        return string.toString(16)
    }


    if (encoding == 'utf-8' || encoding == 'utf8') {
        return string
    }

    if (encoding == 'base64') {
        return btoa(string)
    }
    
    throw new Error(`Unsupported encoding: "${encoding}"`)
}

const AES_ALG = 'AES-GCM'
const PBKDF2 = 'PBKDF2'

const AES_LENGTH = 256

export const DERIVE_KEY_OPTIONS = {
    name: PBKDF2,
    iterations: 1e5,
    hash: 'SHA-256'
}

export const _createPassphrase = async (password, salt, options) => {
    const passwordKey = await subtle.importKey(
        'raw',
        encode(password),
        { name: PBKDF2 },
        false,
        ['deriveKey']
    )

    if(salt) {
        salt = encode(salt)
    } else {
        salt = getRandomBuffer()
    }

    const masterKey = await subtle.deriveKey(
        {
            name: PBKDF2,
            salt,
            iterations: 1e5,
            hash: 'SHA-256'
        },
        passwordKey,
        { name: AES_ALG, length: AES_LENGTH },
        false,
        ['wrap', 'unwrap']
    )

    return {
        passphrase: masterKey,
        salt: decode(salt)
    }
}

export const decrypt = async (cipherText, iv, key) => {
    const buffer = await subtle.decrypt(
        { name: AES_ALG, iv: encode(iv) },
        key,
        encode(cipherText)
    )

    return decode(buffer)
}

// master_key 140896
// pbkdf2(master_key) -> passphrase_key
// pkcs_decrypt(encrypted_private_key, passphrase_key) -> private_key
// rsa_decrypt(encrypted_secret_key, private_key) -> secret_key
// aes_decrypt(encrypted_text, secret_key) -> text

export const decryptUnlockPrivateKey = async (encryptedUnlockPrivateKey, passphrase) => {}
export const decryptSecretKey = async (encryptedSecretKey, unlockPrivateKey) => {}
export const decryptCipherText = async(cipherText, key, iv) => {}

const PBKDF2_ITERATIONS_COUNT = 1e5
const PBKDF2_DIGEST_FUNCTION = 'SHA-512'

export const createPassphraseKey = async password => {
    const key = await subtle.importKey(
        'raw',
        encode(password),
        { name: PBKDF2 },
        false,
        ['deriveKey']
    )

    return key
}
export const createPassphrase = async (key, salt) => {
    const passphraseKey = await subtle.deriveKey(
        {
            name: PBKDF2,
            salt: encode(salt),
            iterations: PBKDF2_ITERATIONS_COUNT,
            hash: PBKDF2_DIGEST_FUNCTION
        },
        key,
        { name: 'AES-KW', length: 256 },
        true,
        ['wrapKey', 'unwrapKey']
    )

    return await passphraseKey
    // return await crypto.subtle.exportKey('jwk', passphrase)
}

const KEY_PAIR_ALG = 'RSA-OAEP'
const KEY_PAIR_MODULUS_LENGTH = 4096
const KEY_PAIR_PUBLIC_EXPONENT = new Uint8Array([1, 0, 1])
const KEY_PAIR_DIGEST_FUNCTION = 'SHA-512'

export const generateKeyPair = async () => {
    return await subtle.generateKey(
        {
            name: KEY_PAIR_ALG,
            modulusLength: KEY_PAIR_MODULUS_LENGTH,
            publicExponent: KEY_PAIR_PUBLIC_EXPONENT,
            hash: KEY_PAIR_DIGEST_FUNCTION
        },
        true,
        ['wrapKey', 'unwrapKey']
    )
}

const generateSecretKey = async () => {
    return await subtle.generateKey(
        {
            name: AES_ALG,
            length: AES_LENGTH
        },
        true,
        ['encrypt', 'decrypt']
    )
}

export const encrypt = async (text, options) => {
    const iv = getRandomString(16)
    
    const [passphraseKey, secretKey] = await Promise.all([
        createPassphraseKey(options.masterKey, options.salt),
        generateSecretKey()
    ])

    // console.log('master', options.masterKey)
    // console.log('passphrase', passphraseKey)
    // console.log('private', keyPair.privateKey)
    // console.log('public', keyPair.publicKey)
    // console.log('secret', secretKey)

    const [cipherText, encryptedSecretKey] = await Promise.all([
        subtle.encrypt({ name: AES_ALG, iv: encode(iv) }, secretKey, encode(text)),
        subtle.wrapKey('jwk', secretKey, keyPair.publicKey, { name: 'RSA-OAEP' })
    ])
    
    return {
        cipherText: btoa(decode(cipherText)),
        secretKey: btoa(decode(encryptedSecretKey)),
        privateKey: btoa(decode(encryptedPrivateKey)),
        iv: btoa(iv)
    }
}

export const _decrypt = async (text, options) => {
    const passphrase = await createPassphraseKey(options.master)
    const keyPair = await unwrapPrivate(options.private)
}