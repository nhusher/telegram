
let wrtc = require('wrtc')
let express = require('express')
let bodyParser = require('body-parser')

let {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate
} = wrtc

let app = express()
let pc = new RTCPeerConnection()
pc.ondatachannel = evt => {
  let dc = evt.channel

  dc.onopen = () => {
    console.log("data channel opened")
  }
  dc.onmessage = e => {
    console.log(e)
    dc.send('pong')
  }
}

app.use(bodyParser.json())
app.use(express.static(__dirname))

app.post('/ice-candidate', (req, res) => {
  pc.addIceCandidate(new RTCIceCandidate(req.body))
    .then(r => {
      res.end()
    }, e => {
      console.error(e)
      res.end()
    })
})

app.post('/offer', (req, res) => {
  pc.setRemoteDescription(new RTCSessionDescription(req.body))
    .then(() => pc.createAnswer())
    .then(answer => {
      pc.setLocalDescription(answer).then(() => {
        res.json(answer)
        res.end()
      })
    })
})


app.listen(8081)