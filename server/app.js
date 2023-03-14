const express = require('express')
const app = express()
const { Server } = require('socket.io')
const io = new Server(3000, {
  cors: {
    origin: ['http://localhost:5173']
  }
})

const userList = []

io.on('connection', (socket) => {
  const username = socket.handshake.query.username
  if (!username) return

  const userInfo = userList.find(user => user.username === username)
  if (userInfo) {
    userInfo.id = socket.id
  } else {
    userList.push({
      id: socket.id,
      username
    })
  }

  io.emit('online', {
    userList
  })

  socket.on('send', ({ fromUsername, targetId, msg }) => {
    const targetSocket = io.sockets.sockets.get(targetId)
    const toUser = userList.find(user => user.id === targetId)

    targetSocket.emit('receive', {
      fromUsername,
      toUsername: toUser.username,
      msg,
      dateTime: new Date().getTime()
    })
  })

})

app.listen(8000, () => {
  console.log('OK')
})
