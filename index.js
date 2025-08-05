const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')

// تحميل الحالة من ملف
const { state, saveState } = useSingleFileAuthState('./auth.json')

// بدء الاتصال
const startSock = () => {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  // متابعة حالة الاتصال
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error instanceof Boom &&
        lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut

      console.log('connection closed. Reconnecting:', shouldReconnect)

      if (shouldReconnect) {
        startSock()
      }
    }

    if (connection === 'open') {
      console.log('✅ Bot connected successfully')
    }
  })

  // حفظ التوكن
  sock.ev.on('creds.update', saveState)
}

startSock()
