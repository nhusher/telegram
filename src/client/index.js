/* globals fetch: false */

import RtcSocket from './RtcSocket'
import uuid from './uuid'

let id = uuid()

function sendCandidate (candidate) {
  fetch(`http://localhost:8081/ice-candidate/${id}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(candidate)
  })
}

function sendOffer (offer) {
  return fetch(`http://localhost:8081/offer/${id}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(offer)
  }).then(res => res.json())
}

let config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]}
let socket = new RtcSocket(config)

socket.createChannel('test', {
  ordered: false,
  maxPacketLifetime: 750
})
socket.on('icecandidate', sendCandidate)
socket.on('close', () => console.log("CLOSED!"))
socket.on('message', evt => {
  console.log(evt)
})
socket.createOffer(sendOffer).then(() => console.log(socket))

let text = document.querySelector('#text')
let ping = document.querySelector('#ping')

ping.onclick = () => {
  socket.send('test', text.value)
}

window.sock = socket