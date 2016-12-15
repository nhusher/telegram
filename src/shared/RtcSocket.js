function on (o, e, h) {
  o.addEventListener(e, h)
  return () => o.removeEventListener(e, h)
}

module.exports = function (RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, Super) {
  return class RtcSocket extends Super {
    constructor (config) {
      super()

      let pc = new RTCPeerConnection(config)

      this.peerConnection = pc
      this.channels = {}

      on(pc, 'icecandidate', e => {
        if (e.candidate) this.emit('icecandidate', e.candidate)
      })

      on(pc, 'iceconnectionstatechange', e => {
        if (pc.iceConnectionState === 'disconnected') {
          this.emit('close')
        }
      })

      on(pc, 'datachannel', event => {
        this._addChannel(event.channel)
      })
    }

    send (channel, payload) {
      this.channels[channel].send(payload)
    }

    receiveOffer (offer) {
      let pc = this.peerConnection

      return pc.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => pc.createAnswer())
        .then(answer => pc.setLocalDescription(answer).then(() => answer))
    }

    createOffer (tx) {
      let pc = this.peerConnection

      return pc.createOffer()
        .then(offer =>
          Promise.all([offer, tx(offer)]))
        .then(([offer, answer]) => Promise.all([
          pc.setLocalDescription(offer),
          pc.setRemoteDescription(new RTCSessionDescription(answer))]))
        .then(() => {})
    }

    addIceCandidate (candidate) {
      return this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    }

    createChannel (name, config) {
      this._addChannel(this.peerConnection.createDataChannel(name, config))
    }

    _addChannel (dc) {
      console.log('recv datachannel', dc.label)
      this.channels[dc.label] = dc

      on(dc, 'open', () => {
        console.info(`Data channel [${dc.label}] opened.`)
      })
      on(dc, 'close', () => {
        console.info(`Data channel [${dc.label}] closed.`)
        delete this.channels[dc.label]
      })
      on(dc, 'message', event => {
        this.emit('message', {
          channel: dc.label,
          data: event.data
        })
      })
    }
  }
}
