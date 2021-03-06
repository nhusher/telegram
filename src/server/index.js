let server = require('http').createServer()
// let WebSocketServer = require('ws').Server
let express = require('express')
let bodyParser = require('body-parser')
let path = require('path')
let RtcSocket = require('./RtcSocket')

let PORT = process.env.PORT || '8081'

// let wss = new WebSocketServer({ server })
// wss.on('connection', ws => {
//   console.log('connected', ws)
// })

let app = express()

let connections = {}

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '..', 'assets')))

app.post('/ice-candidate/:sesId', (req, res) => {
  if (!connections[req.params.sesId]) res.end()

  let pc = connections[req.params.sesId]

  pc.addIceCandidate(req.body).then(r => {
    res.end()
  }, e => {
    console.error(e)
    res.end()
  })
})

app.post('/offer/:sesId', (req, res) => {
  let socket = new RtcSocket({'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]})
  connections[req.params.sesId] = socket

  socket.on('message', msg => {
    console.log(msg)
    Object.keys(connections).forEach(k => {
      let s = connections[k]

      if (s !== socket) s.send(msg.channel, msg.data)
    })
  })

  socket.receiveOffer(req.body).then(answer => {
    res.json(answer)
    res.end()
  }).catch(err => {
    console.log(err)
    res.end()
  })
})

console.log(`Starting application on port ${PORT}`)
server.on('request', app)
server.listen(PORT)
