/* globals fetch: false */

function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0
    let v = c === 'x' ? r : (r & 0x3 | 0x8)

    return v.toString(16)
  })
}

let RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection
let RTCSessionDescription = window.RTCSessionDescription
let config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]}
let pc = new RTCPeerConnection(config)
let dc = pc.createDataChannel('test')
let btn = document.querySelector('#ping')
let id = uuid()

btn.onclick = () => {
  dc.send('ping')
}

dc.onopen = () => {
  console.log('data channel open')
}

dc.onmessage = e => {
  console.log(e)
}

pc.onicecandidate = event => {
  if (!event.candidate) return

  fetch(`http://localhost:8081/ice-candidate/${id}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(event.candidate)
  })
}

pc.createOffer().then(offer => {
  pc.setLocalDescription(offer)

  fetch(`http://localhost:8081/offer/${id}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(offer)
  }).then(res => res.json())
    .then(answer => pc.setRemoteDescription(new RTCSessionDescription(answer)))
    .then(out => console.log(pc))
})
