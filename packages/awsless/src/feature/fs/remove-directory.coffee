
import fs from 'fs'

export default (directory) ->
	if fs.existsSync directory
		fs.rmSync directory, { recursive: true }


# import rimraf from 'rimraf'

# export default (directory) ->
# 	return new Promise (resolve, reject) ->
# 		rimraf directory, (error) ->
# 			if error then reject error
# 			else resolve()
