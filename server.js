var path = require("path")
var express = require("express")
var exphbs = require("express-handlebars")
var http = require("http")
var { Server } = require("socket.io")

var app = express()
var server = http.createServer(app)
var io = new Server(server)
var port = process.env.PORT || 3522

var promptToDraw = "Default Prompt"

var gameData = []
var players = []
var playerCtr = 0

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
    var idx = req.query.idx
    if(gameData[idx]){
       res.render("writePrompt", {
            imgURL: gameData[idx], // give the player who is requesting the page the data of the next player index
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

    //Listen for playerConnected from client containing locally stored playerID
    socket.on("playerConnected", (data) => {
        console.log("  -- NewPlayer:", data.socketId)
        players.push(data.socketId)
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
        gameData[data.idx] = data.canvasData
        playerCtr++
        if(playerCtr == players.length){
            io.emit("nextScreen", "prompt")
        }
    })

    // Listen for text input from the client
    socket.on("sendInput", (data) => {
        console.log("Received input:", data)

        promptToDraw = data

        // Broadcast the data to all connected clients
        io.emit("receiveInput", data)
    })

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("Server-side socket ID disconnected:", socket.id)
        console.log("")
    })
})

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})