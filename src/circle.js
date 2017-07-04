// const mapSegments = require('./map-segments')

module.exports = (center, radius) => {
  const circle = new window.Path2D()
  circle.moveTo(
    ...center.map((x, y) => {
      return [x + radius, y + radius]
    })
  )
  circle.arc(...center, radius, 0, 2 * Math.PI)
  return circle
}
