var request = require('request')

// With username parsed from request, check that the user has submitted a
// PR to jlord/Patchwork.
// called by: checkPR(username, function(err, pr){ prStatus(res, err, pr) })
// callback includes a function which sends the pr boolean on as a response

module.exports = function (username, callback) {
  var options = {
    url: 'https://api.github.com/repos/jlord/patchwork/issues?state=all&creator=' + username,
    json: true,
    headers: {
      'User-Agent': 'request',
      'Authorization': 'token ' + process.env['REPOROBOT_TOKEN']
    }
  }

  request(options, getIssues)

  function getIssues (error, response, body) {
    if (error) return callback(error, null)
    var issues = body
    var pr = false
    // No issues/PRs from this user
    if (issues.length === 0) return callback(null, pr)

    for (var i = 0; i < issues.length; i++) {
      var issue = issues[i]
      if (issue.pull_request) pr = true
    }

    callback(null, pr)
  }
}
