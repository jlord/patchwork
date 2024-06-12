var request = require('request')

// When a new invite email is recieved this is
// called and all of the pending invites are accepted
module.exports = function acceptInvites (callback) {
  var options = {
      url: 'https://api.github.com/user/repository_invitations',
      json: true,
      headers: { 'User-Agent': 'request',
                 'Authorization': 'token ' + process.env['REPOROBOT_TOKEN'],
                 'Accept': 'application/vnd.github.swamp-thing-preview+json'
      }
  }

  acceptBatch()
  var isDone = false

  function thunk (err) {
    if (isDone) return
    isDone = true
    callback(err)
  }

  function acceptBatch () {
    request(options, function gotInvites (err, response, body) {
      var acceptedCount = 0

      if (err) return thunk(err)
      if (response.statusCode !== 200) {
	console.log('Bad invite request', response.statusCode)
	return thunk(new Error('Not a 200 response'))
      }
      // Return if there are no pending invites
      var inviteCount = body.length
      if (inviteCount === 0) return thunk()
      console.log(new Date(), 'Accepting', body.length, 'invites')
      body.forEach(function getID (invite) {
        var username = invite.inviter.login
        var inviteID = invite.id
        // Accept each invite
        options.url = 'https://api.github.com/user/repository_invitations/' + inviteID
        request.patch(options, function accepted (err, response, body) {
          if (err) return thunk(err)
          console.log(new Date(), 'Accepted invite from', username, inviteID, response.statusCode)
          acceptedCount++
          // Once you've accepted 30, the batch max, try again
          // to see if there are more, else you're done!
          if (acceptedCount === 30) return acceptBatch()
          if (acceptedCount === inviteCount) return thunk()
        })
      })
    })
  }
}
