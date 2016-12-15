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

rtcSocket.createChannel('test')
rtcSocket.on('icecandidate', sendCandidate)
rtcSocket.createOffer(sendOffer).then(() => console.log(rtcSocket))

window.sock = rtcSocket