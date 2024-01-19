var hbs = require('handlebars')
var fs = require('fs')
var request = require('request')
var btoa = require('btoa')

var clearUser = require('./clearuser.js')

module.exports = function (callback) {
  if (process.env['CONTRIBUTORS']) {
    fs.readFile(process.env['CONTRIBUTORS'], function (err, data) {
      if (err) return callback(err, 'Error reading contribs file for building page.')
      organizeData(data)
    })
  } else {
    console.log('Making request for data...')
    var uri = 'http://reporobot.jlord.us/data'
    request({ url: uri, json: true }, function (err, res, body) {
      if (err) return callback(err, 'Fetching latest data for building page')
      organizeData(JSON.stringify(body))
    })
  }

  function organizeData (data) {
    var everyone = JSON.parse(data)
    var archiveCount = 12425
    var everyoneCount = everyone.length + archiveCount
    var everyoneCommas = everyoneCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    var newest = everyone[everyone.length - 1]
    var topHundred = everyone.reverse().slice(0, 100)
    var stats = { featured: newest, everyone: topHundred, total: everyoneCommas }
    return getTemplate(stats, everyone)
  }

  function getTemplate (stats, everyone) {
    fs.readFile('template.hbs', function (err, file) {
      if (err) return callback(err, 'Error reading template file.')
      file = file.toString()
      var template = hbs.compile(file)
      var HTML = template(stats)
      return writeRepo(HTML, stats, everyone)
    })
  }

  function writeRepo (HTML, stats, everyone) {
    var username = stats.featured.user
    var baseURL = 'https://api.github.com/repos/'

    var reqHeaders = {
      'User-Agent': 'request',
      'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
    }

    var options = {
      headers: reqHeaders,
      url: baseURL + 'jlord/patchwork/contents/index.html',
      json: true,
      body: {
        'branch': 'gh-pages',
        'committer': {
          'name': 'reporobot',
          'email': '60ebe73fdad8ee59d45c@cloudmailin.net'
        },
        'sha': '',
        'content': btoa(HTML),
        'message': 'Rebuilt index with ' + username
      }
    }

    request.get(options, function (err, res, body) {
      if (err) return callback(err, 'Error fetching SHA')
      options.body.sha = body.sha
      request.put(options, function (err, res, body) {
        if (err) return callback(err, 'Error writing new index to Patchwork')
        console.log(new Date(), 'Rebuilt index with ' + username)
        clearUser(username, callback)
      })
    })
  }
}
