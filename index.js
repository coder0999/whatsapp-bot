const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@adiwajshing/baileys')
const { Boom } = require('@hapi/boom')
const P = require('pino')

const { state, saveState } = useSingleFileAuthState('./auth.json')

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: 'silent' })
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            if (shouldReconnect) {
                startBot()
            }
        } else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp!")
        }
    })

    sock.ev.on('creds.update', saveState)

    // مثال على الرد التلقائي
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const from = msg.key.remoteJid
        const message = msg.message.conversation || msg.message.extendedTextMessage?.text

        if (message === 'ping') {
            await sock.sendMessage(from, { text: 'pong 🏓' })
        }
    })
}

startBot()
