const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
const peerVideo = document.createElement('video')
myVideo.muted = true

const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443',
})

var userName = prompt('Please enter your name...')

//Connects this device media to the stream
let myVideoStream
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream
    addVideoStream(myVideo, myVideoStream)
  })

const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  const div = document.createElement('div')
  const h = document.createElement('h4')
  videoGrid.append(div)
  div.append(video)
}

//Opens connection i.e makes a call
peer.on('open', (id) => {
  socket.emit('join-room', { ROOM_ID: ROOM_ID, id: id, name: userName })
})

//Answer the call
peer.on('call', (call) => {
  call.answer(myVideoStream)
  call.on('stream', (userVideoStream) => {
      console.log(userVideoStream)
    addVideoStream(peerVideo, userVideoStream)
  })
})

//After user has answered the call
socket.on('user-connected', (data) => {
  console.log(data)
  connectToNewUser(data, myVideoStream)
})

// socket.emit('join-room', ROOM_ID);

const connectToNewUser = (data, stream) => {
  const call = peer.call(data.id, stream)
  const video = document.createElement('video')
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })
}

let text = $('input')

$('html').keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', { name: userName, message: text.val() })
    text.val('')
  }
})

socket.on('createMessage', (data) => {
  console.log(data)
  let addClass
  if (data.name == userName) {
    addClass = 'right'
    name = ''
  } else {
    addClass = 'left'
    name = data.name + ' :'
  }
  $('ul').append(
    `<div class='message'>
    <li class='${addClass} msgText'><b style='text-transform:capitalize'>${name}</b><br/>${data.message}</li>
    </div>`,
  )
  scrollToBottom()
})

const scrollToBottom = () => {
  let d = $('.main__chat__window')
  d.scrollTop(d.prop('scrollHeight'))
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false
    setUnmuteButton()
  } else {
    setMuteButton()
    myVideoStream.getAudioTracks()[0].enabled = true
  }
}

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
    <span>Mute</span>`
  document.querySelector('.main__mute__button').innerHTML = html
}

const setUnmuteButton = () => {
  const html = `<i  class=" unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`
  document.querySelector('.main__mute__button').innerHTML = html
}

const videoOnOff = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false
    setVideoOff()
  } else {
    setVideoOn()
    myVideoStream.getVideoTracks()[0].enabled = true
  }
}

const setVideoOn = () => {
  const html = `<i class="fas fa-video"></i>
    <span>Video ON</span>`
  document.querySelector('.main__onoff__button').innerHTML = html
}

const setVideoOff = () => {
  const html = `<i class="videoOff fas fa-video-slash"></i>
    <span>Video OFF</span>`
  document.querySelector('.main__onoff__button').innerHTML = html
}
