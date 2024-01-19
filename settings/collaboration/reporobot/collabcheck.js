// TODO use request here instead
var Github = require('github-api')

// With username parsed from query, check to see if @RR has read/write access
// to user's fork of Patchwork. This means they have been added as a collab.
// Pass boolean on to callback.
// Called by:
// checkCollab(username, function(err, collab) { collabStatus(r, e, collab) })

module.exports = function (username, callback) {
  var github = new Github({
    auth: 'oauth',
    token: process.env['REPOROBOT_TOKEN']
  })

  var repo = github.getRepo(username, 'patchwork')
  var collab = false

  repo.show(function (err, repo) {
    if (err) return callback(err.error)

    var permissions = repo.permissions
    if (permissions.push) {
      collab = true
      callback(null, collab)
    } else {
      collab = false
      callback(null, collab)
    }
  })
}
