module.exports = (center, arrLength) => {
  return ([x, y], i, arr) => {
    const a = Math.PI * 2 / (arrLength || arr.length) * i // << needs to be total radians / amount
    const coordinates = [
      center[0] + y * a * Math.cos(a),
      center[1] + y * a * Math.sin(a)
    ]
    return [...coordinates]
  }
}
