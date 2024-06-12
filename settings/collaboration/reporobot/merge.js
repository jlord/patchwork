var request = require('request')
var asciify = require('asciify')

var messages = require('./messages.json')
var addContributor = require('./contributors.js')

var baseURL = 'https://api.github.com/repos/jlord/patchwork/'
var stats = {}

// When a new, open Pull Request comes in via the webhook set on jlord/patchwork
// the request is queued and one by one sent here to verify the PR is a part of
// the Git-it challenges (and not a real, other one) and to verify the file
// contents of the PR and merge, making comments when needed.
// called by:
// mergePR(pullreq, function(err, message) { if (err) console.log(new Date(), message, err)
  // callback(err)
// })

module.exports = function (pullreq, callback) {
  if (pullreq.pull_request) pullreq = pullreq.pull_request
  var prBranch = pullreq.head.ref.toLowerCase()
  stats.user = pullreq.user.login
  stats.prNum = pullreq.number

  // if branch name doesn't include username, it may be
  // a non git-it related normal PR
  if (!prBranch.match(stats.user.toLowerCase())) {
    return writeComment(messages.antipattern_branch, stats.prNum)
  }

  var options = {
    url: baseURL + 'pulls/' + stats.prNum,
    json: true,
    headers: { 'User-Agent': 'request',
               'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
    }
  }

  function getTime (error, response, body) {
    if (error) return callback(error, 'Error in request on PR via number')
    // if a test pr is coming in from @RR
    var info
    if (!error && response.statusCode === 200 && pullreq.user.login === 'reporobot') {
      info = body
      stats.time = info.created_at.toLocaleString()
      // RR is PRing on behalf of:
      console.log(new Date(), 'PR ', stats.prNum, 'Reporobot Pull Request on behalf of ', stats.user)
      return getFile(stats.prNum)
    }

    if (!error && response.statusCode === 200 && pullreq.user.login !== 'reporobot') {
      info = body
      stats.time = info.created_at
      return getFile(stats.prNum)
    }

    callback(body)
  }

  request(options, getTime)

  function getFile (prNum) {
    var options = {
      url: baseURL + 'pulls/' + prNum + '/files',
      json: true,
      headers: {
        'User-Agent': 'request',
        'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      }
    }

    request(options, function returnFiles (error, response, body) {
      if (error || body.length === 0) return callback(error, 'Error finding file in PR')

      if (!error && response.statusCode === 200) {
        if (body.length > 1) {
          console.log(new Date(), 'PR ', stats.prNum, 'MORE THAN ONE FILE ', stats.user)
          return writeComment(messages.multi_files, stats.prNum)
        }

        var prInfo = body[0]
        // TODO do empty files not have a patch property?
        if (prInfo === undefined || !prInfo.patch) {
          console.log(new Date(), 'PR ', stats.prNum, 'FILE IS EMPTY ', stats.user)
          return writeComment(messages.empty_file, stats.prNum)
        }

        return verifyFilename(prInfo)
      }
      // huh? why sending this back to function(err, message)?
      callback(body)
    })
  }

  function verifyFilename (prInfo) {
    var filename = prInfo.filename.toLowerCase()
    if (filename.match('contributors/add-' + stats.user.toLowerCase())) {
      console.log(new Date(), 'PR ', stats.prNum, 'Filename: MATCH ', stats.user)
      return verifyContent(prInfo)
    } else {
      return writeComment(messages.bad_filename, stats.prNum)
    }
  }

  function verifyContent (prInfo) {
    // pull out the actual pr content
    var patchArray = prInfo.patch.split('@@')
    var patch = patchArray.pop()
    // generate the expected content
    asciify(stats.user, { font: 'isometric2' }, function (err, res) {
      if (err) return callback(err, 'Error generating ascii art to test against')
      if (patch !== stats.user) {
        stats.userArt = res
        console.log(new Date(), 'PR ', stats.prNum, 'Content: MATCH ', stats.user)
        return setTimeout(mergePR(stats.prNum), 5000)
      } else {
        return writeComment(messages.bad_ascii, stats.prNum)
      }
    })
  }

  function writeComment (message, prNum) {
    stats.user = stats.user || 'a skipped PR'
    console.log(new Date(), 'PR ' + prNum + ' Uh oh, writing comment for ' + stats.user)
    var options = {
      url: baseURL + 'issues/' + prNum + '/comments',
      headers: {
        'User-Agent': 'request',
        'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
      },
      json: {'body': message}
    }

    request.post(options, function doneWriteComment (error, response, body) {
      if (error) return callback(error, 'Error writing comment on PR')
      callback()
    })
  }

  function mergePR (prNum) {
    var tries = 0
    var limit = 25

    tryMerge()

    function tryMerge () {
      var message = 'Merging PR from @' + stats.user
      var options = {
        url: baseURL + 'pulls/' + prNum + '/merge',
        headers: {
          'User-Agent': 'request',
          'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
        },
        json: {'commit_message': message}
      }

      request.put(options, function doneMerge (error, response, body) {
        if (error) return callback(error, 'Error merging PR')
        if (response.statusCode !== 200) {
          console.log(new Date(), prNum, 'ERROR MERGING', response.statusCode, body.message)
          console.log(new Date(), prNum, 'TRYING AGAIN')
          if (tries <= limit) {
            tries++
            return setTimeout(tryMerge(prNum), 3000)
          } else {
            callback(null, new Date() + 'Could not merge after ' + limit + ' tries ' + prNum)
          }
        }
        if (!error && response.statusCode === 200) {
          console.log(new Date(), 'PR ', prNum, 'MERGED', stats.user)
          // add contributor to file and then rebuild page
          return addContributor(stats, callback)
        } else {
          callback(error, body)
        }
      })
    }
  }
}
