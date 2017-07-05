const soundBoard = require('sound-board')
const userMedia = require('./user-media')
const Color = require('color')
const circle = require('./circle')
const shape = require('./shape')
const mapSegments = require('./map-segments')
const canvas = document.createElement('canvas')

document.body.appendChild(canvas)
canvas.style = 'position:absolute;top:0;left:0;'

let stream
let soundData = []
let accumData = []
let beatUpperLimit = 170
let maxFFT = 0
let spread = 100
let fftAmount = 1024 * 2
let blue = 255
let green = 255
let red = 255
let blueMod = -1
let greenMod = -3
let redMod = -5
let bgColor = '#222'
let lineWidth = 1

const isBeat = () => maxFFT > beatUpperLimit

soundBoard.on('frequencyData', onData)

const loadStream = async () => {
  const stream = await userMedia()
  await soundBoard.loadStream('microphone', stream)
  return await soundBoard.play('microphone', false)
}

function onData(src, bufferLength, dataArray) {
  const data = []
  const sliceWidth = bufferLength * 1.0 / bufferLength
  let x = 0
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / fftAmount
    const y = v * spread
    data.push([x, y])
    x += sliceWidth
  }
  soundData = data
  if (accumData.length === 2) {
    accumData.shift()
  }
  accumData.push(data)
  maxFFT = Math.max(...dataArray)
}

function getOffset(i) {
  return i * (i % 3 === 0 ? 0.03 : i % 5 === 0 ? 0.04 : 0.02)
}

function radialGradient(center, width, baseColor, ctx) {
  const gradient = ctx.createRadialGradient(...center, width, ...center, 0)
  const method = baseColor.dark() ? 'lighten' : 'darken'
  gradient.addColorStop(0, baseColor[method](0.3))
  gradient.addColorStop(1, baseColor[method](0.4))
  return gradient
}

function draw() {
  requestAnimationFrame(draw)
  const color = Color([red, green, blue])
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const center = [canvas.width / 2, canvas.height / 2]

  //cleanup
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.translate(0, 0)
  ctx.scale(1, 1)

  // fancy bg gradients
  ctx.fillStyle = radialGradient(center, window.innerWidth, Color(bgColor), ctx)
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // generate spiral
  const points = accumData
    .reduce((accum, sdata) => [...accum, ...sdata], [])
    .reverse()
    .map(mapSegments(center, soundData.length / 10))

  // make a line between points (sort of curved)
  // ctx.beginPath()
  // ctx.moveTo(...points[0])
  // for (let i = 1; i < points.length + 1; i += 2) {
  //   const point2 = points[i + 1]
  //   if (point2) ctx.quadraticCurveTo(...points[i], ...point2)
  // }
  // ctx.strokeStyle = ctx.fillStyle = color.lighten(0.3)
  // ctx.lineWidth = lineWidth
  // ctx.stroke()

  // generate some shapes on the points
  points.forEach((point, i) => {
    const offset = getOffset(i)
    // every 5th is a shape that is not a circle
    const factory = i % 5 === 0 ? shape : circle
    const size = 3 * offset
    ctx.fillStyle = radialGradient(
      point,
      size,
      color.alpha(0.002 * i).lighten(i % 7 === 0 ? 0.1 * offset : 0),
      ctx
    )
    const path = factory(
      point,
      size,
      // every 3rd is a triangle 5th is a octogon and everything else is a hexagon
      i % 3 === 0 ? 3 : i % 5 === 0 ? 8 : 6
    )
    ctx.fill(path)
  })

  // debug sine wave
  // soundData.forEach((point, i) => {
  //   ctx.fillStyle = color
  //   const path = shape(point, 1, 4)
  //   ctx.fill(path)
  // })

  // beat detect and change color on beat
  if (isBeat()) {
    blue += blueMod
    if (blue < 0) {
      blueMod = 1
    } else if (blue > 255) {
      blueMod = -1
    }
    green += greenMod
    if (green < 0) {
      greenMod = 3
    } else if (green > 255) {
      greenMod = -3
    }
    red += redMod
    if (red < 0) {
      redMod = 1
    } else if (red > 255) {
      redMod = -5
    }
  }
}

loadStream().then(draw)
