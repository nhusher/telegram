let EventEmitter = require('events')
let wrtc = require('wrtc')
let factory = require('../shared/RtcSocket')

let {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate
} = wrtc

module.exports = factory(RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, EventEmitter)
