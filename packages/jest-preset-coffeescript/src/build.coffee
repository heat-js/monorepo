{ spawn } = require 'child_process'

distFiles = [
  'src/transform.coffee'
  'src/dependencyExtractor.coffee'
]

rootFiles = [
  'src/jest-preset.coffee'
]

spawn 'coffee', ['--compile', '--output', 'dist', distFiles...]

spawn 'coffee', ['--compile', '--output', '.', rootFiles...]
