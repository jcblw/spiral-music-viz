const getUserMedia = require('getusermedia')

module.exports = function usermedia() {
  return new Promise((resolve, reject) => {
    getUserMedia({ audio: true }, (err, stream) => {
      if (err) return reject(err)
      resolve(stream)
    })
  })
}
