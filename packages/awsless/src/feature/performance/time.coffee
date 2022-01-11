
import pretty from 'pretty-hrtime'

export default ->
	start = process.hrtime()
	return ->
		return pretty process.hrtime start
