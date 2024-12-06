export const makeString = (length: number): string => {
    let randomString = ''
    let alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let i = 0; i < length; i++) {
        randomString += alphabets[Math.floor(Math.random() * length)]
    }
    return randomString
}
