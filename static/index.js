//Switch Screens
var submitPromptButton = document.getElementById("submit-prompt")
submitPromptButton.addEventListener("click", switchToDraw)

var submitDrawingButton = document.getElementById("submit-drawing")
submitDrawingButton.addEventListener("click", switchToPrompt)

var prompt = document.querySelectorAll(".prompt-entry")
var drawWindow = document.querySelectorAll(".prompt-draw")

function switchToDraw() {
    prompt[0].style.display = "none"
    drawWindow[0].style.display = "block"
}

function switchToPrompt() {
    drawWindow[0].style.display = "none"
    prompt[0].style.display = "flex"
}

//Color Swap
window.onload = function() {
    var randomDegree = Math.floor(Math.random() * 360)
    document.querySelector('.bg').style.setProperty('--hue-rotate', randomDegree + 'deg')
};

//Canvas
var canvas = document.getElementById("canvas")
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