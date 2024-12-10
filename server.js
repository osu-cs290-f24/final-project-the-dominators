var path = require("path")
var express = require("express")
var exphbs = require("express-handlebars")
var http = require("http")
var { Server } = require("socket.io")

var app = express()
var server = http.createServer(app)
var io = new Server(server)
const PORT = process.env.PORT || 3000

var canvasData = []
var promptData = []
var players = []
var playerCtr = 0
var round = 0
var playerCount = 0
var gameInSession = false

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
    console.log((((idx + 1) % players.length) + (((round - 2) / 2) * players.length)))
    //console.log(canvasData)
    if(canvasData[(((idx + 1) % players.length) + (((round - 2) / 2) * players.length))]){
       res.render("writePrompt", {
            imgURL: canvasData[(((idx + 1) % players.length) + (((round - 2) / 2) * players.length))],
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
    var idx = parseInt(req.query.idx)
    console.log("CURRENT ROUND:", round)
    console.log((((idx + 1) % players.length) + (((round - 1) / 2) * players.length)))
    console.log(promptData)
    res.render("drawPrompt", {
        prompt: promptData[(((idx + 1) % players.length) + (((round - 1) / 2) * players.length))]
    }) 
})

app.get("/results/:index", function (req, res) {
    var idx = parseInt(req.params.index)
    var firstPrompt = promptData[idx]
    var tempArr = []
    var previous
    var next
    console.log(idx)

    var currIDX = idx

    for (var i = 1; i < players.length; i++) {
        if (i % 2 == 0) {

            currIDX = ((idx + (2 * parseInt(i/2))) % players.length) + (players.length * parseInt(i/2))

            var resultCard = {
                prompt: promptData[currIDX], 
                imgURL: "", 
                username: players[currIDX % players.length].username
            }

        } else {
            var resultCard = {prompt: "", 
                imgURL: canvasData[currIDX + 1], 
                username: players[(currIDX + 1) % players.length].username}
        }

        tempArr[i-1] = resultCard
    }

    if (idx == 0) {
        previous = false
    } else {
        previous = true
    }

    if (idx == players.length - 1) {
        next = false
    } else {
        next = true
    }

    res.render("results", {
        username: players[idx].username,
        firstPrompt: firstPrompt,
        results: tempArr,
        previous: previous,
        next: next
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
        if (!gameInSession) {
            var player = {id: data.socketId, username: data.username}
            players.push(player)
            console.log(players)
        }
    })
    socket.on("whichPlayer", (data) => {
        //console.log("  -- Player socket ID from client:", data.socketId)

        var index

        for (var i = 0; i < players.length; i++) {
            if (data.socketId == players[i].id) {
                index = i
                console.log("FOUND PLAYER INDEX: ", players[i].id)
                break
            }
        }

        io.emit("receiveIndex", {socketId: data.socketId, idx: index})
    })

    socket.on("startButtonPressed", (data) => {
        if (!gameInSession) {
            gameInSession = true;
            io.emit("startGame", "")
        } else {
            io.emit("startGame", data)
        }
    })

    socket.on("canvasUpdate", (data) => {
        canvasData[data.idx + (((round - 1) / 2) * players.length)] = data.canvasData
        playerCtr++
        if(playerCtr == players.length){
            if (round == players.length - 1) {
                //  End game
                io.emit("endGame")
                io.emit("nextScreen", "gameEnd")
                // round = 0
                // players = []
                // canvasData = []
                // promptData = []
            } else {
                io.emit("nextScreen", "prompt")
                round++
            }
            playerCtr = 0
        }
    })

    // Listen for text input from the client
    socket.on("sendInput", (data) => {
        console.log("Received input:", data.promptData)

        promptData[data.idx + ((round / 2) * players.length)] = data.promptData
        playerCtr++
        if(playerCtr == players.length){
            if (round == players.length - 1) {
                //  End game
                io.emit("endGame")
                io.emit("nextScreen", "gameEnd")
                // round = 0
                // players = []
                // canvasData = []
                // promptData = []cls

            } else {
                io.emit("nextScreen", "draw")
                round++
            }
            playerCtr = 0
        }

        // Broadcast the data to all connected clients
        io.emit("receiveInput", data)
}) 
    
    socket.on("removePlayer", (data) => {
        console.log("  -- Attempting to Remove Player:", data)
        for (var i = 0; i < players.length; i++) {
            if (players[i] && players[i].id == data) {
                players.splice(i, 1)
                console.log("  -- Removed Player:", data)
            }
        }
    })

    socket.on("joinLobby", (data) => {
        console.log("PLAYERCOUNT++")
        playerCount++
        io.emit("updatePlayers", playerCount)
    })

    socket.on("leaveLobby", (data) => {
        console.log("PLAYERCOUNT--")
        playerCount--
        io.emit("updatePlayers", playerCount)
    })

    socket.on("joinLobbyWait", (data) => {
        playerCtr++
        if(playerCtr == players.length){
            playerCtr = 0
            gameInSession = false
            round = 0
            players = []
            canvasData = []
            promptData = []
            io.emit("nextScreen", "lobby")
        }
    })

    // Handle disconnect
    socket.on("disconnect", (data) => {
        console.log("Server-side socket ID disconnected:", socket.id)
    })
})

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})