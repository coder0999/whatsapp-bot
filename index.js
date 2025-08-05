const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys')
const { join } = require('path')
const fs = require('fs')

const { state, saveState } = useSingleFileAuthState('./auth.json')

async function startSock() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    })

    sock.ev.on('creds.update', saveState)

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text

        if (text?.toLowerCase() === 'hi') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Hello! 🤖' })
        } else if (text?.toLowerCase() === 'ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Pong 🏓' })
        }
    })
}

startSock()
