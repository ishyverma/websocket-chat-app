import { WebSocketServer, WebSocket } from "ws";
import { makeString } from "./utils/makeString";

const wss = new WebSocketServer({ port: 8080 })

const rooms: Record<string, WebSocket[]> = {}

wss.on('connection', (socket) => {
    socket.on('message', (message) => {
        const parsedMessage = JSON.parse(message.toString())
        if (parsedMessage.type == 'createRoom') {
            const roomId = makeString(5)
            rooms[roomId] = []
            socket.send('Room Created Succesffully')
        }

        if (parsedMessage.type == 'getRooms') {
            const allRooms = []
            for (const room in rooms) {
                allRooms.push({ roomName: room, numberOfActiveUsers: rooms[room].length })
            }
            socket.send(JSON.stringify(allRooms))
        }

        if (parsedMessage.type == 'join') {
            const roomId = parsedMessage.payload.roomId
            if (!rooms[roomId]) {
                rooms[roomId] = []
            }
            if (rooms[roomId].includes(socket)) {
                socket.send('Already Joined This Room')
                return
            }
            rooms[roomId].push(socket)
            socket.send("Joined Successfully")
        }

        if (parsedMessage.type == 'message') {
            const message = parsedMessage.payload.message
            const roomId = parsedMessage.roomId
            const username = parsedMessage.username
            if (!rooms[roomId]) {
                socket.send('No room exists')
                return
            }
            if (!rooms[roomId].includes(socket)) {
                socket.send("You are not in this room")
                return
            }
            rooms[roomId].filter(sockets => sockets !== socket).map(sockets => sockets.send(message))
        }
    })
    socket.on('close', () => {
        Object.keys(rooms).forEach(room => {
            if (rooms[room].includes(socket)) {
                rooms[room].splice(rooms[room].indexOf(socket), 1)
            }
            if (rooms[room].length == 0) {
                delete rooms[room]
            }
        })
    })
})