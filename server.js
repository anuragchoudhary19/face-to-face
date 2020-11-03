// const firebase = require('firebase')
// const axios = require('axios')
const express = require('express')
const { ExpressPeerServer } = require('peer')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')

const peerServer = ExpressPeerServer(server, {
  debug: true,
})

// const firebaseApp = firebase.initializeApp({
//   apiKey: 'AIzaSyCuSq6-JS-E-Qox9PN_KPDmYAHoBH0xU20',
//   authDomain: 'face-to-face-4e231.firebaseapp.com',
//   databaseURL: 'https://face-to-face-4e231.firebaseio.com',
//   projectId: 'face-to-face-4e231',
//   storageBucket: 'face-to-face-4e231.appspot.com',
//   messagingSenderId: '469033613149',
//   appId: '1:469033613149:web:6b397e4cfd3a6c01a31ab4',
//   measurementId: 'G-DG3WYD0W77',
// })
// const db = firebaseApp.database()

app.set('view engine', 'ejs')
//app.use(express.static('public'))
app.use(express.static(__dirname + '/public'))
app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
  const data = { roomId: 'home', status: 'offline' }
  res.render('home', { data: data })
})
app.get('/create-room', (req, res) => {
  res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
  const data = { roomId: req.params.room, status: 'online' }
  res.render('home', { data: data })
})

io.on('connect', (socket) => {
  socket.on('join-room', (data) => {
    // axios.post(
    //   'https://face-to-face-4e231.firebaseio.com/users/' +
    //     data.ROOM_ID +
    //     '.json',
    //   {
    //     key: data.id,
    //     username: data.name,
    //     roomId: data.ROOM_ID,
    //   },
    // )

    socket.join(data.ROOM_ID)
    socket.to(data.ROOM_ID).emit('user-connected', data)
    socket.on('message', (message) => {
      io.to(data.ROOM_ID).emit('createMessage', message)
    })
    socket.on('disconnect', () => {
      socket.to(data.ROOM_ID).broadcast.emit('user-disconnected', data.id)
    })
  })
})

server.listen(process.env.PORT || 5000)
