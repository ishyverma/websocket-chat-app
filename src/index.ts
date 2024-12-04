import { WebSocket, WebSocketServer } from "ws"

const wss = new WebSocketServer({ port: 8080 })

let allSockets: Record<string, WebSocket[]> = {}

wss.on("connection", (socket) => {
    socket.on("message", (data) => {
        const parsedData = JSON.parse(data.toString())
        if (parsedData.type === "join") {
            const roomId = parsedData.payload.roomId
            if (!allSockets[roomId]) {
                allSockets[roomId] = []
            }
            const isInRoom = allSockets[roomId].some(sockets => sockets == socket) 
            if (isInRoom) {
                socket.send("Already in the room")
                return;
            }
            allSockets[roomId].push(socket)
        }
        if (parsedData.type == "chat") {
            const roomId = parsedData.roomId
            if (!allSockets[roomId]) {
                socket.send("No Room Exists")
            }
            allSockets[roomId].filter(sockets => sockets !== socket).map(sockets => sockets.send(parsedData.payload.message))
        }
    })
    socket.on("close", () => {
        Object.keys(allSockets).forEach(key => {
            if (allSockets[key].includes(socket)) {
                allSockets[key].splice(allSockets[key].indexOf(socket), 1)
            }

            if (allSockets[key].length == 0){
                delete allSockets[key]
            }
        })
        socket.terminate()
    })
})