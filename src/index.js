const soundBoard = require('sound-board')
const Delaunator = require('delaunator')
const userMedia = require('./user-media')
const Color = require('color')
const circle = require('./circle')
const triangle = require('./triangle')
const mapSegments = require('./map-segments')
const canvas = document.createElement('canvas')

document.body.appendChild(canvas)
canvas.style = 'position:absolute;top:0;left:0;'

let stream
let soundData = []
let maxFFT = 150
let max = 0
let spread = 200
let fftAmount = 4096

const isBeat = () => max > maxFFT

soundBoard.on('frequencyData', onData)

const loadStream = async () => {
  const stream = await userMedia()
  await soundBoard.loadStream('microphone', stream)
  return soundBoard.play('microphone', false)
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
  max = Math.max(...dataArray)
}

let blue = 255
let red = 255
let blueMod = -1
let redMod = -3

function draw() {
  requestAnimationFrame(draw)
  const color = Color([red, 0, blue])
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const center = [canvas.width / 2, canvas.height / 2]
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#222'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.translate(0, 0)
  ctx.scale(1, 1)
  const points = soundData.map(mapSegments(center, soundData.length / 10))
  ctx.beginPath()
  ctx.moveTo(...points[0])
  // for (let i = 1; i < points.length + 1; i += 2) {
  //   const point2 = points[i + 1]
  //   if (point2) ctx.quadraticCurveTo(...points[i], ...point2)
  // }
  ctx.strokeStyle = ctx.fillStyle = color.lighten(0.3)
  ctx.lineWidth = 1
  ctx.stroke()

  points.forEach((point, i) => {
    const offset = i * (i % 3 === 0 ? 0.03 : i % 5 === 0 ? 0.04 : 0.02)
    const factory = i % 5 === 0 ? triangle : circle
    ctx.save()
    ctx.strokeStyle = color
      .green(offset * 10)
      .lighten(i % 7 === 0 ? 0.1 * offset : 0)
    const path = factory(
      point,
      1 * offset,
      i % 3 === 0 ? 3 : i % 5 === 0 ? 8 : 6
    )
    ctx.stroke(path)
    ctx.restore()
  })

  soundData.forEach((point, i) => {
    ctx.save()
    ctx.fillStyle = color
    const path = triangle(point, 1, 4)
    ctx.fill(path)
    ctx.restore()
  })
  if (isBeat()) {
    blue += blueMod
    if (blue < 0) {
      blueMod = 1
    } else if (blue > 255) {
      blueMod = -1
    }
    red += redMod
    if (red < 0) {
      redMod = 3
    } else if (red > 255) {
      redMod = -3
    }
  }
}

loadStream().then(draw)
