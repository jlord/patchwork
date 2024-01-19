var Github = require('github-api')
var asciify = require('asciify')
var request = require('request')

module.exports = function(sourceAccount, viaAccount, n) {

  var github = new Github({
      auth: "oauth",
      token: process.env['REPOROBOT_TOKEN']
  })

  // STEP ONE
  // Delete existing add-username branch from viaAccounts
  checkViaBranches()

  function checkViaBranches() {
    var repo = github.getRepo(viaAccount, 'patchwork')

    // does branch exist?
    repo.listBranches(function(err, branches) {
      if (err) return console.log(err, "error reading branches from " + viaAccount)
      var branchname = "add-" + viaAccount
      // branches.forEach(function(branch, i) {
      //   console.log(branches.length, i)
      //   console.log(branch, branchname)
      //   if (branch.match(branchname)) {
      //     console.log("Match")
      //     return deleteViaBranch(repo)
      //   }
      // })
      // console.log("Branch not there.")
      // cleanOriginal()
      for (var i = 0; i < branches.length; i++) {
        if (branches[i].match(branchname)) {
          console.log(n, 1 , "Branch exists on " + viaAccount + " deleting...")
          return deleteViaBranch()
        }
        if (branches.length === i + 1 && !branches[i].match(branchname)) {
          console.log(n, 1 , "No existing branch on " + viaAccount)
          return cleanOriginal()
        }
      }
    })

    function deleteViaBranch() {
      repo.deleteRef('heads/add-' + viaAccount, function(err) {
        if (err && err.error != '422') return console.log(err, "error deleting ref on via")
        console.log(n, 1 , '...Deleted branch on ' + viaAccount)
        cleanOriginal()
      })
    }
  }


  // STEP TWO
  // Find and delete merged-in contributors/add-username.txt from sourceAccount
  function cleanOriginal() {
    var origRepo = github.getRepo(sourceAccount, 'patchwork')

    var headers = {"user-agent": "reporobot", "auth": "oauth"}
    headers["token"] = 'token ' + process.env['REPOROBOT_TOKEN']
    var url = 'https://api.github.com/repos/jlord/patchwork/contents/contributors?ref=gh-pages'

    // make sure file doesn't already exist, if it does, delete it
    // using request because for some reason github-ap isn't working
    request(url, {json: true, headers: headers}, function matchFile(error, response, body) {
      if (error) return console.log(error, "Error getting branch contents")
      var files = body
      var filename = 'add-' + viaAccount + '.txt'

      for (var i = 0; i < files.length; i++) {
        if (files[i].name.match(filename)) {
          console.log(n, 2 , "File contributors/add-" + viaAccount + " exists on " + sourceAccount + " deleting...")
          return deleteFile()
        }
        if (files.length === i + 1 && !files[i].name.match(filename)) {
          console.log(n, 2 , "Found no matching file on " + sourceAccount)
          return createViaBranch()
        }
      }

      // files.forEach(function(file, i) {
      //   if (file.name.match(filename)) {
      //     return deleteFile()
      //   }
      //   if (files.length === i + 1) {
      //     console.log("Checked no matching file on " + sourceAccount)
      //     return // createViaBranch()
      //   }
      // })
    })

    // STEP TWO.ONE
    // Delete file
    function deleteFile() {
      origRepo.delete('gh-pages', 'contributors/add-' + viaAccount + '.txt', function(err) {
        if (err) return console.log(err.request.responseText, "Error deleting " + viaAccount + '.txt on original')
        console.log(n, 2 , "Deleted file contributors/add-" + viaAccount + '.txt on source ' + sourceAccount)
        createViaBranch()
      })
    }
  }

  // // make sure branch doesn't already exist, if it does, delete it
  // function checkBranch() {
  //   repo.listBranches(function(err, branches) {
  //     if (err) return console.log(err, "error reading branches")
  //     for (var i = 0; i < branches.length; i++) {
  //       if (branches[i].match("add-" + viaAccount)) return deleteBranch()
  //     }
  //     createViaBranch()
  //   })
  // }
  //
  // // delete branch
  // function deleteBranch() {
  //   repo.deleteRef('heads/add-' + viaAccount, function(err) {
  //     if (err) return console.log(err, "error deleting ref")
  //     createViaBranch()
  //     return console.log('Deleted branch /add-'+ viaAccount + ' on source ' + sourceAccount)
  //   })
  // }

  // STEP THREE
  // Re-create branch add-username on viaAccount
  // Get new repo object
  function createViaBranch() {
    var repo = github.getRepo(viaAccount, 'patchwork')

    repo.branch('gh-pages', 'add-' + viaAccount, function(err) {
      if (err) return console.log(err, "error creating branch on via")
      console.log(n, 3 , "Created branch add-" + viaAccount + " on " + viaAccount)

      createArt()
    })
  }

  // function createViaBranch() {
  //   // getting the sha
  //   console.log("Repo", viaAccount, "/patchwork")
  //   var headers = {"user-agent": "reporobot", "auth": "oauth"}
  //   headers["token"] = 'token ' + process.env['REPOROBOT_TOKEN']
  //   var url = 'https://api.github.com/repos/' + viaAccount + '/patchwork/git/refs/heads/gh-pages'
  //   console.log(url)
  //   request(url, {json: true, headers: headers}, function(error, response, body) {
  //     if (error) return console.log(error, "Error getting sha")
  //     console.log("SHA", body.object.sha)
  //     createViaBranchActually(body.object.sha)
  //
  //   })
  //
  // }
  // function createViaBranchActually(sha) {
  //   console.log("CreateViaBranchActually running")
  //   var url = 'https://api.github.com/repos/' + viaAccount + '/patchwork/git/refs'
  //   var headers = {
  //     "user-agent": "reporobot",
  //     "auth": "oauth",
  //     "token": 'token ' + process.env['REPOROBOT_TOKEN']
  //   }
  //   var ref = "refs/heads/add-" + viaAccount
  //   console.log([headers, ref, url, sha])
  //
  //   request.put({
  //       uri: url,
  //       json: {'ref': ref, 'sha': sha},
  //       headers: headers},
  //     function(error, response, body) {
  //       if (error) return console.log(error, "Error making new branch")
  //       console.log(['body of createviabranchactually', body])
  //       console.log("Created branch add-" + viaAccount + " on " + viaAccount)
  //       // createArt()
  //   })
  // }


  // STEP FOUR
  // Make ascii art
  function createArt(repo) {
    asciify(viaAccount, {font:'isometric2'}, function(err, res){
      if (err) callback(err, "Error generating ascii art to test against")
      console.log(n, 4 , "Drew art for " + viaAccount)
      writeFile(res)
    })
  }

  // STEP FIVE
  // Write ascii art to contributors/add-username.txt on add-username branch
  function writeFile(art) {
    var repo = github.getRepo(viaAccount, 'patchwork')

    repo.write('add-' + viaAccount, 'contributors/add-' + viaAccount + '.txt', art, 'TEST add-' + viaAccount, function(err) {
      if (err) return console.log(err, "error writing file")
      console.log(n, 5 , "Wrote file contributors/add-" + viaAccount + ".txt to " + viaAccount)
      createPR()
    })
  }

  // STEP SIXE
  // Create pull request on jlord/patchwork on behalf of viaAccount
  function createPR() {
    var pull = {
      title: "TEST add " + viaAccount,
      body: "Testing multiple PRs, this one " + viaAccount,
      base: "gh-pages",
      head: viaAccount + ":" + "add-" + viaAccount
    }

    var pullReqRepo = github.getRepo(sourceAccount, 'patchwork')

    pullReqRepo.createPullRequest(pull, function(err, pullRequest) {
      if (err) return console.log(err, "error creating PR")
      console.log(n, 6, "Created Test PR for " + viaAccount, pullRequest.number)
    })
  }
}
