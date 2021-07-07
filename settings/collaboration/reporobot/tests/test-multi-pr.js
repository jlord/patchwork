#!/usr/bin/env node

var pr = require(__dirname + '/test-onbehalfof.js')
var runParallel = require('run-parallel')

// var accounts = ['jllord', 'goldenrod', 'eviljlord', 'maxogden', 'reporobot']
var accounts = ['jllord', 'eviljlord', 'goldenrod']
var sourceAccount = 'jlord'
var n = 0
accounts.forEach(function(account) {
  n++
  console.log(n, 0, "Running for " + account)
  pr(sourceAccount, account, n)
})
