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
let rtcSocket = new RtcSocket(config)

rtcSocket.createChannel('test', {
  ordered: false,
  maxPacketLifetime: 750
})
rtcSocket.on('icecandidate', sendCandidate)
rtcSocket.on('close', () => console.log("CLOSED!"))
rtcSocket.createOffer(sendOffer).then(() => console.log(rtcSocket))

let text = document.querySelector('#text')
let ping = document.querySelector('#ping')

ping.onclick = () => {
  rtcSocket.send('test', text.value)
}

window.sock = rtcSocket