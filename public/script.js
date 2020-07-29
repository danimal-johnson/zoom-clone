const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
});
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    call.answer(stream);

    // Display the other person's video
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    }); // on(stream)

  }); // on(call)

  socket.on('user-connected', userId => {
    console.log(userId, "connected");
    connectToNewUser(userId, stream);
  }); // on(user-connected)

}); // .then

socket.on('user-disconnected', userId => {
  console.log(userId, "disconnected");
  if(peers[userId])
    peers[userId].close();
}) // on(user-disconnected)

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
}) // on(open)

// socket.on('user-connected', userId => {
//   console.log('Peer', userId, 'connected.');
// })

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  })
  call.on('close', () => {
    video.remove();
  })

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  });
  videoGrid.append(video);
}