var http = require('http')
var fs = require('fs')
var url = require('url')

var async = require('async')
var concat = require('concat-stream')

var checkPR = require('./prcheck.js')
var checkCollab = require('./collabcheck.js')
var checkEmail = require('./email.js')
var mergePR = require('./merge.js')

// q to slow it down enough for the GitHub API
var q = async.queue(function que (pullreq, callback) {
  console.log(new Date(), 'QUEUE', pullreq.number)
  mergePR(pullreq, function donePR (err, message) {
    if (err) return callback(err, message)
    callback()
  })
}, 1)

console.log('QUEUE LENGTH', q.length())

q.drain = function drain () { console.log('Queue drain') }

module.exports = function () {
  var server = http.createServer(router)

  // router routes the requests to RR
  // to the appropriate places
  function router (req, res) {
    console.log('(ノ・∀・)ノ')
    console.log(new Date(), req.method, req.url)

    // End point to latest data
    if (req.url === ('/data')) { return sendData(res) }

    // When RR gets a push from email when added as collab
    // Email from GitHub -> cloudmail.in -> here
    if (req.url === '/push') {
      return handleEmail(req, res)
    }

    // When Git-it verifies user added RR as collab
    // Comes from verify step in Git-it challenge #8
    if (req.url.match('/collab')) {
      queryURL = url.parse(req.url, true)
      username = queryURL.query.username
      return checkCollab(username, function (err, collab) {
        collabStatus(res, err, collab)
      })
    }

    // When a PR is made to patchwork repo
    // Comes from a GitHub webhook Patchwork repo
    if (req.url.match('/orderin')) {
      return handlePR(req, res)
    }

    // When Git-it verifies user made a PR
    // Comes from verify step in Git-it challenge #10
    var queryURL
    var username
    if (req.url.match('/pr')) {
      queryURL = url.parse(req.url, true)
      username = queryURL.query.username
      return checkPR(username, function (err, pr) {
        // TODO prStatus and collabStatus could be a shared method
        prStatus(res, err, pr)
      })
    }

    // When any other request goes to reporobot.jlord.us
    res.statusCode = 404
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      error: 404,
      message: 'not_found'
    }, true, 2))
  }

  function handleEmail (req, res) {
    req.pipe(concat(function (buff) {
      try {
        var emailObj = JSON.parse(buff)
      } catch (e) {
        return console.log(new Date(), 'Error parsing email JSON', req.headers, buff.length, [buff.toString()])
      }

      checkEmail(emailObj, function checkedEmail (err, message) {
        if (err) console.log(new Date(), message, err)
      })
    }))

    // TODO Why is this needed, and otherwise
    // cutting off getting the whole request
    setTimeout(function () {
      res.statusCode = 200
      res.end('Thank you.')
    }, 1000)
  }

  function handlePR (req, res) {
    req.pipe(concat(function (buff) {
      try {
        var pullreq = JSON.parse(buff)
      } catch (e) {
        return console.log(new Date(), 'Error parsing PR JSON', req.headers, buff.length, [buff.toString()])
      }

      // TODO do this check elsewhere, this should just be routing
      // Check if it's a closed PR
      if (pullreq.action && pullreq.action === 'closed') {
        console.log(new Date(), 'SKIPPING: Closed pull request')
      } else {
        // Send open PR to the queue
        q.push(pullreq, function (err, message) {
          if (err) return console.log(new Date(), message, err)
          console.log(new Date(), pullreq.number, 'Finished PR')
        })
      }

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.end('Thank you.')
    }))
  }

  // Response to Git-it on the existence of user's PR
  function prStatus (res, err, pr) {
    if (err) {
      console.log(err)
      res.statusCode = 500
      res.end(JSON.stringify({ error: err }))
      return
    }
    console.log(new Date(), 'PR check response:', pr )
    res.statusCode = 200
    res.end(JSON.stringify({
      pr: pr
    }, true, 2))
  }

  // Response to Git-it on RR being added as collab
  function collabStatus (res, err, collab) {
    if (err) {
      console.log(new Date, 'Error getting collab status:', err)
      res.statusCode = 500
      res.end(JSON.stringify({ error: err }))
      return
    }
    console.log(new Date(), 'Collab check response:', collab )
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      collab: collab
    }, true, 2))
  }

  function sendData (res) {
    fs.readFile(process.env['CONTRIBUTORS'], function readContrData (err, data) {
      if (err) return console.log(new Date(), err)
      console.log(new Date(), 'Responding with contributor data')
      res.statusCode = 200
      res.end(JSON.stringify(JSON.parse(data.toString())))
    })
  }

  return server
}
