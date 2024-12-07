//Switch Screens
var index
var resultsPageIdx = 0

function switchBackToLobby(){
    window.location.href = "/"
}

function switchToDraw() {
    window.location.href = `/draw?idx=${encodeURIComponent(index)}`
}

function switchToPrompt() {
    window.location.href = `/write?idx=${encodeURIComponent(index)}`
}

function switchToEndGameScreen() {
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
    
    document.getElementById("red").addEventListener("click", function() {
        context.strokeStyle = "red"
        strokeWidth = 5
    })
    
    document.getElementById("blue").addEventListener("click", function() {
        context.strokeStyle = "blue"
        strokeWidth = 5
    })
    
    document.getElementById("green").addEventListener("click", function() {
        context.strokeStyle = "green"
        strokeWidth = 5
    })
    
    document.getElementById("yellow").addEventListener("click", function() {
        context.strokeStyle = "yellow"
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
        socket.emit("removePlayer", playerSocketId)
        return
    }
    
    if (data == playerSocketId) {
        alert("Game already in session")
    } else if (data == "") {
        switchToPrompt()
    }
})

function switchToLobby(){
    username = document.getElementById("username-text").value
    
    localStorage.setItem("username", username)

    socket.emit("playerConnected", {socketId: socket.id, username: username})

    window.location.href = "/lobby"
}

function sendInput(event) {
    event.preventDefault()
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

socket.on("receiveInput", (data) => {
    const promptElement = document.getElementById("prompt")
    if (promptElement) {
        promptElement.textContent = data // Update the displayed prompt
    }
})

socket.on("receiveIndex", (data) => {
    if (data.socketId == playerSocketId) {    
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
        switchToPrompt()
    } else if (data == "draw") {
        switchToDraw()
    } else if(data == "lobby"){
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
    //localStorage.removeItem("socketId")
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