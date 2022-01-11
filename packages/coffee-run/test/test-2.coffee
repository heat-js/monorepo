
import path from 'path'
event = require 'events'

console.log "Test: 1", 'test'.replace /[\`\'\"]/g, ''

''.replace /(\`)/g, "'"

a1 = 1
a2 = '2'

console.log 'Test: 2', "#{a1}/#{a2}"
console.log 'Test: 3', "jjj#{a2}"
console.log 'Test: 3', process.env.TEST1
console.log 'Test: 3', process.env.TEST2
