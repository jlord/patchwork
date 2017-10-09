var fs = require('fs')

var file = process.env['CONTRIBUTORS']
var buildPage = require('./buildpage.js')

module.exports = function (stats, callback) {
  fs.readFile(file, function (err, data) {
    if (err) return callback(err, 'Error reading contribs file.')

    var oldData = data.toString()
    var array

    if (oldData === '') array = []
    else array = JSON.parse(oldData)

    array.push(stats)

    fs.writeFile(file, JSON.stringify(array), function (err) {
      if (err) return callback(err, 'Error writing new contribs file')
      var lastUser = array[array.length - 1]
      if (lastUser) console.log(new Date(), 'Added user ' + lastUser.user + ' to contributors.json')
      else console.log('no last user')
      return buildPage(callback)
    })
  })
}
