var request = require('request')
var tape = require('tape')

var emailData = require('./email-payload.json')

// send a sample email payload to RR's server to trigger
// the contribution on test account, goldenrod. Then fetch
// commits to verify RR commited.

tape("Test RR collaborates on users' repos", function(t) {

  var options = {
    url: 'http://reporobot.jlord.us/push',
    json: true,
    body: emailData
  }

  // send a sample email payload to RR server
  request.post(options, function done(err, res, body) {
    if (err) {
      t.error(err, "Error posting email payload")
      return t.end()
    }
    setTimeout(checkForCommit(), 5000)
  })

  function checkForCommit() {
    var timeframe = new Date(Date.now() - 20000)
    var options = {
      headers: { 'User-Agent': 'request' },
      url: 'https://api.github.com/repos/goldenrod/patchwork/commits',
      json: true,
      qs: {
        sha: 'add-goldenrod',
        author: 'reporobot',
        since: timeframe.toISOString()
      }
    }

    // Get commits made on the add-goldenrod branch, by RR in the lasts 20 seconds.
    request(options, function fetchedCommit(err, res, body) {
      if (err || res.statusCode !== 200) {
        t.error(err || res.statusCode, "Error fetching commits")
        return t.end()
      }
      if (body.length < 1) {
        t.fail("No commit found.")
        return t.end()
      }
      t.ok(body.length > 0, "A commit was made recently.")
      t.end()
    })
  }
})

// TODO verify content of commit
