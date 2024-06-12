var asciify = require('asciify')
var btoa = require('btoa')
var request = require('request')

var acceptInvites = require('./accept-invites.js')

module.exports = function (object, callback) {
  // if it's not an email, return
  if (!object.headers) return
  getDetails(object)

  function getDetails (object) {
    var baseURL = 'https://api.github.com/repos/'
    var subject = object.headers.Subject
    console.log(new Date(), 'Received email:', subject)

    if (!subject.match('invited you to')) {
      console.log(new Date(), 'non relevant email')
      return
    }

    var detailsArray = subject.split(' invited you to ')
    var details = { 'username': detailsArray[0],
                    'repo': detailsArray[1] }
    details.fileURI = baseURL + details.repo + '/contents/contributors/' +
                    'add-' + details.username + '.txt'

    details.forSHA = '?ref=add-' + details.username
    console.log(new Date(), details.username, 'invited Reporobot as a collaborator.')

    // When any new invite email comes,
    // go and accept all invites
    acceptInvites(function makeArt (err) {
      if (err) return callback(err, 'Invite error')
      asciiArt(details)
    })
  }

  function asciiArt (details) {
    asciify(details.username, { font: 'isometric2' }, function (err, res) {
      if (err) return callback(err, 'Ascii art error')
      writeRepo(res, details)
    })
  }

  function writeRepo (artwork, details) {
    var reqHeaders = {
      'User-Agent': 'request',
      'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
    }

    var options = {
      headers: reqHeaders,
      url: details.fileURI + details.forSHA,
      json: true,
      body: {
        'branch': 'add-' + details.username,
        'committer': {
          'name': 'reporobot',
          'email': '60ebe73fdad8ee59d45c@cloudmailin.net' },
        'sha': '',
        'content': btoa(artwork),
        'message': 'drew a picture :art:' }}

    request.get(options, function getSHA (err, res, body) {
      if (err) return callback(err, 'Error fetching SHA')
      if (res.statusCode !== 200) return callback('Did not get SHA', body.message)
      options.body.sha = body.sha
      options.url = details.fileURI
      request.put(options, function commitToRepo (err, res, body) {
        if (err) return callback(err, 'Error collabing on forked repo.')
        if (res.statusCode !== 200) return callback('Didn not collab', body.message)
        console.log(new Date(), 'Commited to', details.username, 'repo')
      })
    })
  }
}
