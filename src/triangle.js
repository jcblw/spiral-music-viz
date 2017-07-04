module.exports = (center, radius, length = 4) => {
  const triangle = new window.Path2D()
  const points = new Array(length)
    .join(',')
    .split(',')
    .map(mapSegments(center, radius))
  triangle.moveTo(...points[0])
  for (let i = 1; i < points.length; i += 1) {
    triangle.lineTo(...points[i])
  }
  triangle.closePath()
  return triangle
}

function mapSegments(center, radius) {
  return (_, i, arr) => {
    const a = Math.PI * 2 / arr.length * i // << needs to be total radians / amount
    const coordinates = [
      center[0] + radius * Math.cos(a),
      center[1] + radius * Math.sin(a)
    ]
    return [...coordinates]
  }
}
