const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const peerVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
});

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
});

peer.on('call', call => {
    call.answer(myVideoStream);
    call.on('stream', (userVideoStream) => {
        addVideoStream(peerVideo, userVideoStream);
    });
});

socket.on('user-connected', (userId) => {
    connectToNewUser(userId, myVideoStream);
});


peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

// socket.emit('join-room', ROOM_ID); 

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    videoGrid.append(video);
}


let text = $('input');

$('html').keydown((e) => {
    if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val());
        text.val('');
    }
})

socket.on('createMessage', message => {
    $('ul').append(`<li class='message'><b>User</b><br/>${message}</li>`)
    scrollToBottom();
})

const scrollToBottom = () => {
    let d = $('.main__chat__window');
    d.scrollTop(d.prop('scrollHeight'));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `<i class="fas fa-microphone"></i>
    <span>Mute</span>`
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `<i  class=" unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`
    document.querySelector('.main__mute__button').innerHTML = html;
}

const videoOnOff = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setVideoOff();
    } else {
        setVideoOn();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setVideoOn = () => {
    const html = `<i class="fas fa-video"></i>
    <span>Video ON</span>`
    document.querySelector('.main__onoff__button').innerHTML = html;
}

const setVideoOff = () => {
    const html = `<i class="videoOff fas fa-video-slash"></i>
    <span>Video OFF</span>`
    document.querySelector('.main__onoff__button').innerHTML = html;
}