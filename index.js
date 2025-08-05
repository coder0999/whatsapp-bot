const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const P = require('pino')

const { state, saveState } = useSingleFileAuthState('./auth.json')

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' })
  })

  sock.ev.on('connection.update', (upd) => {
    const { connection, lastDisconnect } = upd
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connection closed:', lastDisconnect.error, ' Reconnect?', shouldReconnect)
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('✅ Connected')
    }
  })

  sock.ev.on('creds.update', saveState)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text
    const from = msg.key.remoteJid
    if (text === 'ping') {
      await sock.sendMessage(from, { text: 'pong 🏓' })
    }
  })
}

startBot()
