var rebuildpage = require('./buildpage.js')

rebuildpage(function done (error, message) {
  if (error) return console.log(error, message)
  if (message) console.log(message)
  console.log('Finished rebuilding page.')
})
