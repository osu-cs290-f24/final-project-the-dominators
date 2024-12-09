//Switch Screens
var index
var resultsPageIdx = 0

function switchBackToLobby() {
    if (window.location.pathname == "/" || window.location.pathname == "/lobby") {
        return
    }
    window.location.href = "/"
}

function switchToDraw() {
    if (window.location.pathname == "/" || window.location.pathname == "/lobby") {
        return
    }
    window.location.href = `/draw?idx=${encodeURIComponent(index)}`
}

function switchToPrompt() {
    window.location.href = `/write?idx=${encodeURIComponent(index)}`
}

function switchToEndGameScreen() {
    if (window.location.pathname == "/" || window.location.pathname == "/lobby") {
        return
    }
    window.location.href = `/results/${resultsPageIdx}}`
}

document.addEventListener("DOMContentLoaded", () => {
    //Color Swap
    var randomDegree = Math.floor(Math.random() * 360)
    document.querySelector(".bg").style.setProperty("--hue-rotate", randomDegree + "deg")

    var playButton = document.getElementById("play-button")
    if (playButton) playButton.addEventListener("click", switchToLobby)

    var startButton = document.getElementById("start-game-button")
    if (startButton) startButton.addEventListener("click", () => startGame())

    var submitPromptButton = document.getElementById("submit-prompt")
    if (submitPromptButton) submitPromptButton.addEventListener("click", sendInput)

    var submitDrawingButton = document.getElementById("submit-drawing")
    if (submitDrawingButton) submitDrawingButton.addEventListener("click", getCanvasData)

    var previousButton = document.getElementById("previous")
    if (previousButton) previousButton.addEventListener("click", () => {
        var splitPath = window.location.pathname.split("/")
        resultsPageIdx = parseInt(splitPath[splitPath.length-1])
        resultsPageIdx--
        switchToEndGameScreen()
    })

    var nextButton = document.getElementById("next")
    if (nextButton) nextButton.addEventListener("click", () => {
        var splitPath = window.location.pathname.split("/")
        resultsPageIdx = parseInt(splitPath[splitPath.length-1])
        resultsPageIdx++
        switchToEndGameScreen()
    })

    var backToLobbyButton = document.getElementById("back-to-lobby")
    if (backToLobbyButton) backToLobbyButton.addEventListener("click", () => {
        var waitScreen = document.getElementById("wait-screen")
        waitScreen.style.display = "flex"
        socket.emit('joinLobbyWait')
    })

    if (window.location.pathname == "/lobby") {
        socket.emit("joinLobby")
    }
    })

//Canvas
var canvas = document.getElementById("canvas")

if (canvas) {
    var context = canvas.getContext("2d")

    canvas.addEventListener("mousedown", startDrawing)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", stopDrawing)
    canvas.addEventListener("mouseout", stopDrawing)

    document.getElementById("white").addEventListener("click", function() {
        context.strokeStyle = "white"
        strokeWidth = 5
    })
    
    document.getElementById("black").addEventListener("click", function() {
        context.strokeStyle = "black"
        strokeWidth = 5
    })

    document.getElementById("gray").addEventListener("click", function() {
        context.strokeStyle = "rgb(80, 80, 80)"
        strokeWidth = 5
    })

    document.getElementById("brown").addEventListener("click", function() {
        context.strokeStyle = "rgb(99, 48, 13)"
        strokeWidth = 5
    })
    
    document.getElementById("red").addEventListener("click", function() {
        context.strokeStyle = "rgb(242, 34, 14)"
        strokeWidth = 5
    })

    document.getElementById("orange").addEventListener("click", function() {
        context.strokeStyle = "rgb(241, 142, 2)"
        strokeWidth = 5
    })
    
    document.getElementById("blue").addEventListener("click", function() {
        context.strokeStyle = "rgb(4, 66, 245)"
        strokeWidth = 5
    })

    document.getElementById("purple").addEventListener("click", function() {
        context.strokeStyle = "rgb(129, 0, 166)"
        strokeWidth = 5
    })

    document.getElementById("green").addEventListener("click", function() {
        context.strokeStyle = "rgb(99, 167, 46)"
        strokeWidth = 5
    })
    
    document.getElementById("yellow").addEventListener("click", function() {
        context.strokeStyle = "rgb(244, 242, 39)"
        strokeWidth = 5
    })
    
    var canvasOffsetX = canvas.getBoundingClientRect().left
    var canvasOffsety = canvas.getBoundingClientRect().top
    
    canvas.width = canvas.getBoundingClientRect().width
    canvas.height = canvas.getBoundingClientRect().height
    
    
    window.onresize = function () {
        context = canvas.getContext("2d")
        canvasOffsetX = canvas.getBoundingClientRect().left
        canvasOffsety = canvas.getBoundingClientRect().top
    }
    
    window.addEventListener("scroll", function() {
        context = canvas.getContext("2d")
        canvasOffsetX = canvas.getBoundingClientRect().left
        canvasOffsety = canvas.getBoundingClientRect().top
    })
    
    var isDrawing = false
    var strokeWidth = 5
    var startX
    var startY
    
    document.getElementById("pen").addEventListener("click", function() {
        context.strokeStyle = "black"
        strokeWidth = 5
    })
    
    document.getElementById("eraser").addEventListener("click", function() {
        context.strokeStyle = "white"
        strokeWidth = 15
    })
    
    document.querySelector(".select-clear").addEventListener("click", function() {
        context.clearRect(0,0,canvas.width, canvas.height)
    })
    
    function startDrawing(event) {
        isDrawing = true
        startX = (event.clientX - canvasOffsetX) * (canvas.width / canvas.getBoundingClientRect().width)
        startY = (event.clientY - canvasOffsety) * (canvas.height / canvas.getBoundingClientRect().height)
    
        context.beginPath()
        context.moveTo(startX, startY)
        event.preventDefault()
    }
    
    function stopDrawing() {
        if (!isDrawing) {
            return
        }
        
        isDrawing = false
        context.stroke()
        context.closePath()
    }
    
    function draw(event) {
        if (!isDrawing) {
            return
        }
    
        context.lineWidth = strokeWidth
        context.lineCap = "round"
        context.lineJoin = "round"
        context.lineTo(event.clientX - canvasOffsetX, event.clientY - canvasOffsety)
        context.stroke()
    }
}

//Send and Receive data
console.log("Attempting to connect to the server...")
const socket = io()
var playerSocketId
var username

socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id)
    if (window.location.pathname == "/") {
        socket.emit("removePlayer", localStorage.getItem("socketId"))
        localStorage.removeItem("socketId")
        localStorage.removeItem("username")
    } else {
        username = localStorage.getItem("username")
    }

    if (!localStorage.hasOwnProperty("socketId")){
        localStorage.setItem("socketId", socket.id)
    } 

    playerSocketId = localStorage.getItem("socketId")
    console.log("Player socket ID from localStorage:", playerSocketId)
    trackPlayer()
})

function startGame() {
    socket.emit("startButtonPressed", playerSocketId)
}

socket.on("startGame", (data) => {
    if (window.location.pathname == "/") {
        socket.emit("removePlayer", localStorage.getItem("socketId"))
        return
    }

    console.log("Game start: ", data)

    if (data == playerSocketId) {
        alert("Game already in session")
    }
    
    if (data == "") {
        switchToPrompt()
    }
})

function switchToLobby(){
    username = document.getElementById("username-text").value

    if (username == "") {
        alert("Please enter a username")
    } else {
        localStorage.setItem("username", username)

        socket.emit("playerConnected", {socketId: socket.id, username: username})

        window.location.href = "/lobby"
    }
}

function sendInput(event) {
    event.preventDefault()

    if (document.getElementById("prompt-text").value == "") {
        alert("Please enter a prompt")
    } else {
        var userInput = {idx: index, promptData: document.getElementById("prompt-text").value}
        if(userInput){
        // Send input to the server
        socket.emit("sendInput", userInput)

        // Clear the input field
        document.getElementById("prompt-text").value = ""
        
        var waitScreen = document.getElementById("wait-screen")
        waitScreen.style.display = "flex"
        // window.location.href = "/draw"
        }
    }
}

socket.on("receiveInput", (data) => {
    const promptElement = document.getElementById("prompt")
    if (promptElement) {
        promptElement.textContent = data // Update the displayed prompt
    }
})

socket.on("receiveIndex", (data) => {
    console.log("Index: ", data.idx)
    console.log("Id: ", localStorage.getItem("socketId"))
    
    if (data.socketId == localStorage.getItem("socketId")) {    
        index = data.idx
    }
})

socket.on("updatePlayers", (data) => {
    var playerCounter = document.getElementById("counter")
    if (playerCounter) playerCounter.textContent = data + " Players Connected"
    trackPlayer()
})

socket.on("nextScreen", (data) => {
    if(data == "prompt") {
        if (window.location.pathname == "/" || window.location.pathname == "/lobby") {
            return
        }
        switchToPrompt()
    } else if (data == "draw") {
        switchToDraw()
    } else if(data == "lobby"){
        if (window.location.pathname == "/lobby") {
            localStorage.setItem("socketId", playerSocketId)
            socket.emit("playerConnected", {socketId: playerSocketId, username: username})
            trackPlayer()
            console.log("Player waiting in lobby:", username," ", playerSocketId, " ", index)
        }

        switchBackToLobby()
    } else {
        switchToEndGameScreen()
    }
})

function trackPlayer(){
    socket.emit("whichPlayer", {socketId: playerSocketId})
}

socket.on("endGame", (data) => {
    endGame()
})

function endGame() {
    console.log("== Game Over")
    localStorage.removeItem("socketId")
    localStorage.removeItem("username")
    //socket.emit("endGame", {socketId: playerSocketId})
}

function getCanvasData(){
    console.log("Retrieved Canvas Data")
    var canvasData = canvas.toDataURL("image/png")
    socket.emit('canvasUpdate', {idx: index, canvasData: canvasData})
    var waitScreen = document.getElementById("wait-screen")
    waitScreen.style.display = "flex"
}

window.addEventListener("unload", () => {
    if (window.location.pathname == "/lobby") {
        socket.emit("leaveLobby")
        //socket.emit("removePlayer", playerSocketId)
    }
})