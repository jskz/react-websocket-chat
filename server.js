import express from 'express'
import http from 'http'
import { Server as WebSocketServer } from 'ws'
import uuid from 'node-uuid'
import p from './protocol'

let server = http.createServer()
let app = new express({server: server})
let wss = new WebSocketServer({server: server})
let users = []

const HTML = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>React WebSocket Chat Example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="/bundle.js" type="text/javascript"></script>
    </head>

    <body>
        <div id="origin"></div>
    </body>
</html>`

app.use(express.static('static'))

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.send(HTML)
})

function sendPacket(ws, type, data) {
    let output

    try {
        output = JSON.stringify({
            type: type,
            data: data
        })
    } catch(err) {
        console.log('Failed to encode packet: ' + err.message)
    }

    try {
        ws.send(output)
    } catch(err) {
        console.log('Failed to send packet: ' + err.message)
    }
}

function selectiveBroadcast(fn, type, msg) {
    users
        .filter(u => fn(u))
        .map(user => sendPacket(user.client, type, msg))
}

let getUserBySocket = (ws) => users.filter(u => u.client === ws).reduce(v => v)

function removeSocket(ws) {
    let index = users.indexOf(getUserBySocket(ws))

    if(index > -1)
        users.splice(index, 1)
}

function broadcast(type, data) {
    selectiveBroadcast(() => true, type, data)
}

function sendUserList(ws) {
    let output = users
        .map(u => {
            return {
                id:       u.id,
                nickname: u.nickname
            }
        })
    sendPacket(ws, p.MESSAGE_USER_LIST, output)
}

function filterUserInput(s) {
    return s
}

wss.on('connection', (ws) => {
    let me = {
        id:         uuid.v4(),
        client:     ws,
        nickname:   null,
        joinedAt:   new Date().getTime()
    }
    users.push(me)

    broadcast(
        p.MESSAGE_USER_JOINS,
        {
            id: me.id,
            nickname: me.nickname,
            joinedAt: me.joinedAt
        })
    sendUserList(ws)

    ws.send(JSON.stringify({
        type: p.MESSAGE_WHO_ARE_YOU,
        data: null
    }))

    ws.on('close', () => {
        removeSocket(ws)
        broadcast(
            p.MESSAGE_USER_LEAVES,
            {
                id: me.id
            }
        )
        return
    })

    ws.on('message', (m) => {
        let decoded = JSON.parse(m)

        if(decoded.type === p.MESSAGE_CHAT) {
            if(!decoded.data.message.length || !me.nickname)
                return;

            broadcast(p.MESSAGE_CHAT, {
                message:    filterUserInput(decoded.data.message),
                timestamp:  new Date().getTime(),
                from:       me.nickname,
                id:         uuid.v4()
            })
            return
        }

        if(decoded.type === p.MESSAGE_CHECK_NICKNAME) {
            if(decoded.data.nickname.length < 3) {
                ws.send(JSON.stringify({
                    type: p.MESSAGE_NAME_TOO_SHORT,
                    data: null
                }))

                return
            }

            if(decoded.data.nickname.length > 14) {
                ws.send(JSON.stringify({
                    type: p.MESSAGE_NAME_TOO_LONG,
                    data: null
                }))

                return
            }

            if(users.filter(u => u.nickname == decoded.data.nickname).length) {
                ws.send(JSON.stringify({
                    type: p.MESSAGE_NAME_IN_USE,
                    data: null
                }))

                return
            }

            ws.send(JSON.stringify({
                type: p.MESSAGE_NICKNAME_VALID,
                data: null
            }))
            return
        }

        if(decoded.type === p.MESSAGE_REQUEST_NICKNAME) {
            if(decoded.data.nickname.length < 3) {
                return
            }
            if(decoded.data.nickname.length > 14) {
                return
            }
            if(users.filter(u => u.nickname == decoded.data.nickname).length) {
                return
            }

            ws.send(JSON.stringify({
                type: p.MESSAGE_NICKNAME_GRANTED,
                data: {nickname: decoded.data.nickname}
            }))

            getUserBySocket(ws).nickname = decoded.data.nickname
            broadcast(
                p.MESSAGE_USER_STATE_CHANGE,
                {
                    id: me.id,
                    nickname: decoded.data.nickname
                })

            broadcast(
                p.MESSAGE_SERVER_MESSAGE,
                {
                    message: `${decoded.data.nickname} has joined the room.`
                }
            )
        }
    })
})

server.on('request', app)
server.listen(8080, () => console.log('Listening on port 8080.'))
