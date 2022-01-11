
import { add } from './dep'

export default (event) ->
	console.log event
	console.log add 1, 2
	console.log add 3, 4
	console.log add 3, 4
