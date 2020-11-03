const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const peer = new Peer(undefined, {
  host: '/',
  port: '443',
  path: '/peerjs',
})
const myPeer = {}
const myVideo = document.createElement('video')
myVideo.muted = true
// let userName = prompt('Please enter your name...')
let mystream
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    mystream = stream
    addVideoStream(myVideo, stream)
  })
  .catch((err) => console.log(err))

peer.on('open', (id) => {
  //console.log(id)
  socket.emit('join-room', { ROOM_ID: ROOM_ID, myId: id, name: 'userName' })
})

socket.on('user-connected', (anotherPeerData) => {
  //console.log('userconnected', anotherPeerData)
  //alert('userconnected')
  requestHandler(anotherPeerData)
})

socket.on('user-disconnected', (userId) => {
  if (myPeer[userId]) {
    myPeer[userId].close()
  }
  //console.log(userId, 'disconnect')
})

peer.on('call', (call) => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      call.answer(stream)
      //console.log('call')
      const video = document.createElement('video')
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream)
      })
    })
})

const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  //const div = document.createElement('div')
  videoGrid.append(video)
  //div.append(video)
  console.log('addvideostream')
}

const connectToNewUser = (id) => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      const call = peer.call(id, stream)
      call.on('stream', (userVideoStream) => {
        const video = document.createElement('video')
        addVideoStream(video, userVideoStream)
        //lert('newuserconnected')
      })
      call.on('close', () => {
        video.remove()
      })
      myPeer[id] = call
    })
}

let text = $('#chat__message')

$('#chat__message').keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', { name: 'userName', message: text.val() })
    text.val('')
  }
})

socket.on('createMessage', (data) => {
  console.log(data)
  let addClass
  if (data.name == 'userName') {
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
  const enabled = mystream.getAudioTracks()[0].enabled
  if (enabled) {
    mystream.getAudioTracks()[0].enabled = false
    setUnmuteButton()
  } else {
    setMuteButton()
    mystream.getAudioTracks()[0].enabled = true
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
  const enabled = mystream.getVideoTracks()[0].enabled
  if (enabled) {
    mystream.getVideoTracks()[0].enabled = false
    setVideoOff()
  } else {
    setVideoOn()
    mystream.getVideoTracks()[0].enabled = true
  }
}

const setVideoOn = () => {
  const html = `<i class="fas fa-video"></i>
    <span>ON</span>`
  document.querySelector('.main__onoff__button').innerHTML = html
}

const setVideoOff = () => {
  const html = `<i class="videoOff fas fa-video-slash"></i>
    <span>OFF</span>`
  document.querySelector('.main__onoff__button').innerHTML = html
}

const requestHandler = (data) => {
  const button = document.createElement('BUTTON')
  button.classList.add('dropdown-item')
  button.setAttribute('id',data.myId)
  button.setAttribute('type', button)
  button.innerHTML = data.name
  button.addEventListener('click', () => {
    connectToNewUser(data.myId)
    document.getElementById(data.myId).remove()
  })
  document.getElementById('main__controls__request').append(button)
}

const createRoom = () => {
  location.assign('/create-room')
}

const leaveGroup=()=>{
  location.assign('/')
}
