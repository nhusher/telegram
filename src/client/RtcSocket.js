import factory from '../shared/RtcSocket'
let RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection
let RTCSessionDescription = window.RTCSessionDescription
let RTCIceCandidate = window.RTCIceCandidate

class EventEmitter {
  constructor () {
    this.events = {}
  }

  on (ev, handler) {
    let events = this.events
    if (!events[ev]) events[ev] = []
    events[ev].push(handler)
  }

  removeListener (ev, handler) {
    let array = this.events[ev]

    array && array.splice(array.indexOf(handler), 1)
  }

  emit (ev, ...args) {
    let array = this.events[ev] || []

    for (var i = 0, len = array.length; i < len; i++) {
      array[i].apply(this, args)
    }
  }

  once (ev, handler) {
    this.on(ev, remover)

    function remover () {
      handler.apply(this, arguments)
      this.removeListener(ev, remover)
    }
  }
}

export default factory(RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, EventEmitter)
