# Reporobot

This is the source code for @reporobot who lives on a server and interacts with
repositories on behalf of [Git-it](http://www.github.com/jlord/git-it). Git-it is a
beginners adventure(!) for learning Git and GitHub, of the
[nodeschool.io](http://www.nodeschool.io) series. Through a series of
challenges, users learn the basics like committing, working with remotes, branching, forking,
pushing, pulling and making pull requests. @reporobot brings fun, not so one-way times
to the challenges like **adding a collaborators**, **pulling changes** and
**verifying pull requests** to the learning experience.

Reporobot is built with Node.js, lives on a [Digital Ocean
Droplet](https://www.digitalocean.com/community/articles/how-to-create-your-first-digitalocean-droplet-virtual-server)
and is deployed with [maxogden/taco](http://www.github.com/maxogden/taco).

## Reporobot's Jobs

#### Verify Git-it Challenges
- There are two challenges in Git-it that need to be verified with the GitHub
  API instead of Git itself like the other challenges. A challenge on verifying
  @reporobot has been added as a collaborator and another verifying that the
  user submitted a pull request. @reporobot returns a true or false for each.

#### Collaborate with Git-it Users
- In one challenge of Git-it, users are asked to add @reporobot as a
  collaborator. When they do @reporobot is notified via the GitHub email which
  sends a webhook via [cloudmailin](www.cloudmailin.com). Then it writes to the
  repository which creates an opportunity for the users to learn about pulling
  in changes and staying in sync.

#### Handle Pull Requests
- When users submit a pull request @reporobot verifies that the pull request is
  as expected. If it is not, it writes a comment on the pull request describing
  what was missing. If it is as expected, it merges the pull request.

#### Builds index
- After a pull request is merged @reporobot adds that user to a list of users
  who have completed all of the challenges. From that list and a with a
  template, it rebuilds and pushes the index.html of
  [jlord/patchwork](http://www.github.com/jlord/patchwork) (the repository
  Git-it users fork and pull request against) with the latest completer.

Busy robot.
