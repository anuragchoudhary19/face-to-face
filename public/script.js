const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let request = 0
const peer = new Peer(undefined, {
  host: '/',
  port: '5000',
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
// if (status == 'offline' || status == 'online') {
peer.on('open', (id) => {
  //console.log(id)
  socket.emit('join-room', { ROOM_ID: ROOM_ID, myId: id, name: 'userName' })
})
// }

socket.on('user-connected', (anotherPeerData) => {
  //console.log('userconnected', anotherPeerData)
  //alert('userconnected')
  request += 1
  requestHandler(anotherPeerData)
  var html = `<i id="notification" class="fas fa-square"><span class="num"></span></i>`
  $('.request__button').append(html)
  var el = document.getElementsByClassName('fa-square')
  el[0].setAttribute('style', 'color:#DC143C !important')
  var num = document.getElementsByClassName('num')
  num[0].setAttribute('style', 'color:#F5F5DC !important')
  num[0].innerHTML = '1'
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
}

const connectToNewUser = (id) => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      const call = peer.call(id, stream)
      const video = document.createElement('video')
      call.on('stream', (userVideoStream) => {
        console.log(userVideoStream)
        addVideoStream(video, userVideoStream)
        console.log('newuserconnected')
      })
      call.on('close', () => {
        video.remove()
      })
      myPeer[id] = call
    })
  request -= 1
  if (request == 0) {
    $('#notification').remove()
    // var el = document.getElementsByClassName('fa-square')
    // el[0].setAttribute('style', 'color:#F5F5DC !important')
    // var num = document.getElementsByClassName('num')
    // num[0].innerHTML = ''
  }
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
  button.setAttribute('id', data.myId)
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

const invite = () => {
  let a = document.getElementById('invitation__link')
  let url = new URL(location.href)
  let params = new URLSearchParams({ roomid: ROOM_ID })
  // params.set('room-id', ROOM_ID)
  // params.set('join', 'join-room')
  let newUrl = location.host + '/join/' + '?' + params.toString()
  a.href = 'mailto:?subject=You are invited to join the room&body=' + newUrl
}
const leaveGroup = () => {
  location.replace('/')
}
const join = () => {
  location.assign('/' + ROOM_ID)
}
