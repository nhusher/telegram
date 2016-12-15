let wrtc = require('wrtc')
let express = require('express')
let bodyParser = require('body-parser')
let path = require('path')

let {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate
} = wrtc

let PORT = process.env.PORT || '8081'

let app = express()
let connections = {}

function doConnect (id, offer) {
  let pc = new RTCPeerConnection()

  connections[id] = pc

  pc.ondatachannel = evt => {
    let dc = evt.channel

    dc.onopen = () => {
      console.log('data channel opened')
    }
    dc.onmessage = e => {
      console.log(e)
      dc.send('pong')
    }
  }

  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === 'disconnected') {
      console.log('Disconnected', id)
      delete connections[id]
    }
  }

  return pc.setRemoteDescription(new RTCSessionDescription(offer))
    .then(() => pc.createAnswer())
    .then(answer => pc.setLocalDescription(answer).then(() => answer))
}

let pc = new RTCPeerConnection()
pc.ondatachannel = evt => {
  let dc = evt.channel

  dc.onopen = () => {
    console.log('data channel opened')
  }
  dc.onmessage = e => {
    console.log(e)
    dc.send('pong')
  }
}

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '..', 'assets')))

app.post('/ice-candidate/:sesId', (req, res) => {
  if (!connections[req.params.sesId]) res.end()

  let pc = connections[req.params.sesId]

  pc.addIceCandidate(new RTCIceCandidate(req.body))
    .then(r => {
      res.end()
    }, e => {
      console.error(e)
      res.end()
    })
})

app.post('/offer/:sesId', (req, res) => {
  doConnect(req.params.sesId, req.body).then(answer => {
    res.json(answer)
    res.end()
  })
})

console.log(`Starting application on port ${PORT}`)
app.listen(PORT)
