import factory from '../shared/RtcSocket'
let RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection
let RTCSessionDescription = window.RTCSessionDescription
let RTCIceCandidate = window.RTCIceCandidate

// Create a fake version of EventEmitter for the browser.
// Based on <https://www.npmjs.com/package/eventemitter-light>
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
    if (array) array.splice(array.indexOf(handler), 1)
  }

  emit (ev, ...args) {
    let array = this.events[ev] || []

    for (let i = 0, len = array.length; i < len; i++) {
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
