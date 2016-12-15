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
          this.emit('closed')
        }
      })

      on(pc, 'datachannel', event => {
        let dataChannel = event.channel

        console.log('recv datachannel', event.channel.label)
        on(dataChannel, 'open', () => {
          console.info(`Data channel [${dataChannel.label}] opened.`)
          this.channels[dataChannel.label] = dataChannel
        })
        on(dataChannel, 'close', () => {
          console.info(`Data channel [${dataChannel.label}] closed.`)
          delete this.channels[dataChannel.label]
        })
        on(dataChannel, 'message', event => {
          this.emit('message', {
            channel: dataChannel.label,
            data: event.data
          })
        })
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

    createChannel (name) {
      let pc = this.peerConnection
      let dc = pc.createDataChannel(name)

      this.channels[name] = dc
    }
  }
}
