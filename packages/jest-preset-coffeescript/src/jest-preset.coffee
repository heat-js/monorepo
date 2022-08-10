path = require 'path'

module.exports =
  moduleFileExtensions: [ 'coffee', 'js' ]
  testMatch: [ '**/*.test.coffee', '**/*.spec.coffee' ]
  dependencyExtractor: path.join __dirname, 'dist', 'dependencyExtractor.js'
  transform:
    '\\.coffee$': path.join __dirname, 'dist', 'transform.js'
