const encode = string => (new Uint8Array(Array.from(string).map(char => char.charCodeAt(0)))).buffer
const decode = buffer => String.fromCodePoint(...Array.from(new Uint8Array(buffer)))

// base64 string -> uint8array
const toBuffer = string => new Uint8Array(encode(string))
// uint8array -> base64 string
const toBase64 = array => decode(new Uint8Array(array))
// const isBase64 = string => /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(string)

let subtle

if (process.browser) {
    subtle = window.crypto.subtle
    if (!subtle) {
        throw new ReferenceError(`Crypto API is unsupported on the device`)
    }
}

// if(!subtle) {
//     let Subtle
//     if (global.SubtleCrypto) {
//         Subtle = SubtleCrypto
//     } else if (global.Crypto) {
//         Subtle = Crypto
//     }

//     if (Subtle) {
//         try {
//             function SubtleConstructor() { }
//             SubtleConstructor.prototype = Object.create(Subtle.prototype)
//             SubtleConstructor.prototype.constructor = SubtleConstructor

//             subtle = new SubtleConstructor()

//             alert(JSON.stringify(Object.keys(SubtleConstructor.constructor)))
//         } catch(e) {
//             alert(e.message)
//         }
//     }
// }

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
export const getRandomPassword = length => decode(_getRandomBuffer(length, saveDict))
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
const AES_LENGTH = 256
const PBKDF2 = 'PBKDF2'

export const AES_GCM_OPTIONS = {
    name: 'AES-GCM',
    length: AES_LENGTH
}

export const AES_KW_OPTIONS = {
    name: 'AES-KW',
    length: AES_LENGTH
}

export const DERIVE_OPTIONS = {
    name: 'PBKDF2',
    iterations: 1e5,
    hash: 'SHA-256'
}

export const decrypt = async (cipherText, iv, key, alg = AES_GCM_OPTIONS) => {
    console.log(cipherText, iv)

    const buffer = await subtle.decrypt(
        Object.assign({
            iv: encode(iv)
        }, alg),
        key,
        encode(cipherText)
    )

    return decode(buffer)
}

export const createPasswordHash = async (password, alg = DERIVE_OPTIONS) => {
    
    try{
        const hash = await subtle.importKey(
            'raw',
            encode(password),
            alg,
            false,
            ['deriveKey']
        )

        return { hash, alg }
    } catch(error) {
        alert(error.message)
    }
}
export const createPassphrase = async (key, salt, kwoptions = AES_KW_OPTIONS, kdOptions = DERIVE_OPTIONS) => {
    if (salt) {
        salt = encode(salt)
    } else {
        salt = getRandomBuffer()
    }
    
    const passphrase = await subtle.deriveKey(
        Object.assign({ salt }, kdOptions),
        key,
        kwoptions,
        false,
        ['wrapKey', 'unwrapKey']
    )

    return { passphrase, salt, alg: kwoptions }
    // return await crypto.subtle.exportKey('jwk', passphrase)
}

export const generateSecretKey = async (options = {}, alg = AES_GCM_OPTIONS) => {
    const key = await subtle.generateKey(
        alg,
        ('extractable' in options) ? options.extractable : false,
        ['encrypt', 'decrypt']
    )

    return { key, alg }
}

export const encrypt = async (text, secretKey) => {
    const iv = getRandomBuffer()
    
    const cipherText = await subtle.encrypt({ name: AES_ALG, iv }, secretKey, encode(text))
    
    return {
        cipherText: decode(cipherText),
        iv: decode(iv)
    }
}

export const createCredentials = async (password, alg = AES_KW_OPTIONS) => {
    const { hash, alg: passwordAlg } = await createPasswordHash(password)

    const { passphrase, salt, alg: passphraseAlg } = await createPassphrase(hash)

    const { key, alg: secretAlg } = await generateSecretKey({ extractable: true })
    
    const format = 'raw'
    const encryptedKey = await subtle.wrapKey(
        format,
        key,
        passphrase,
        alg
    )
    
    return new Map(Object.entries({
        password: passwordAlg,
        passphrase: Object.assign({
            salt: decode(salt)
        }, passphraseAlg),
        secret: Object.assign({
            format,
            key: decode(encryptedKey)
        }, secretAlg)
    }))
}

export const unwrapSecretKey = async credentials => {
    const { password, ...passwordOptions } = credentials.get('password')
    
    const { salt, ...passphraseOptions } = credentials.get('passphrase')

    const { hash, alg: passwordAlg } = await createPasswordHash(password, passwordOptions)

    const { passphrase, alg: passphraseAlg } = await createPassphrase(hash, salt, passphraseOptions, passwordAlg)

    const { key, format, ...secretAlg } = credentials.get('secret')

    return await subtle.unwrapKey(
        format,
        encode(key),
        passphrase,
        passphraseAlg,
        secretAlg,
        false,
        ['encrypt', 'decrypt']
    )
}