var path = require("path")
var express = require("express")
var exphbs = require("express-handlebars")
var http = require("http")
var { Server } = require("socket.io")

var app = express()
var server = http.createServer(app)
var io = new Server(server)
var PORT = process.env.PORT || 3522

var promptToDraw = "Default Prompt"

var gameData = []
var players = []
var playerCtr = 0
var round = 0
var playerCount = 0

app.engine("handlebars", exphbs.engine({
    defaultLayout: "main"
}))
app.set("view engine", "handlebars")

app.use(express.static("static"))

app.get("/", function (req, res) {
    res.render("home") //home has a "Depiction" sign, and a waiting for players sign, and a play button.
})

app.get("/lobby", function(req, res){
    res.render("lobby")
})

app.get("/write", function (req, res) {
    var idx = parseInt(req.query.idx)
    console.log("CURRENT ROUND:", round)
    if(gameData[idx + ((round - 1) * players.length)]){
       res.render("writePrompt", {
            imgURL: gameData[idx + ((round - 1) * players.length)],
            firstPost: false 
        }) 
    }
    else{
        res.render("writePrompt", {
            imgURL: "",
            firstPost: true 
        }) 
    }
})

app.get("/draw", function (req, res) {
    res.render("drawPrompt", {
        prompt: promptToDraw
    })
})

app.get("*", function (req, res) {
    res.render("404")
})

// app.listen(port, function () {
//     console.log("== Server is listening on port", port)
// })

io.on("connection", (socket) => {
    console.log("Server-side socket ID connected:", socket.id)
    playerCount++
    //Listen for playerConnected from client containing locally stored playerID
    socket.on("playerConnected", (data) => {
        console.log("  -- NewPlayer:", data.socketId)
        players.push(data.socketId)
        io.emit("updatePlayers", playerCount)
    })
    socket.on("whichPlayer", (data) => {
        console.log("  -- Player socket ID from client:", data.socketId)

        var index

        for (var i = 0; i < players.length; i++) {
            if (data.socketId == players[i]) {
                index = i
                console.log("FOUND PLAYER")
                break
            }
        }

        io.emit("receiveIndex", {socketId: data.socketId, idx:index})
    })

    socket.on("endGame", (data) => {
        console.log("  -- Game ended. Player disconnected: ", data.socketId)
    })

    socket.on("canvasUpdate", (data) => {
        gameData[data.idx + (round * players.length)] = data.canvasData
        playerCtr++
        if(playerCtr == players.length){
            io.emit("nextScreen", "prompt")
            playerCtr = 0
            round++
        }
    })

    // Listen for text input from the client
    socket.on("sendInput", (data) => {
        console.log("Received input:", data)

        promptToDraw = data

        playerCtr++
        if(playerCtr == players.length){
            io.emit("nextScreen", "draw")
            playerCtr = 0
        }

        // Broadcast the data to all connected clients
        io.emit("receiveInput", data)
    })

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("Server-side socket ID disconnected:", socket.id)
        console.log("")
        playerCount--
        io.emit("updatePlayers", playerCount)
    })
})

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})