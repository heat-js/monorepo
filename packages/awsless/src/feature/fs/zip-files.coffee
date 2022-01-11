
import fs				from 'fs'
import path				from 'path'
import JSZip			from 'jszip'
import { pipeline }		from 'stream'
import LengthStream		from 'length-stream'
import getAllFiles		from 'get-all-files'

export default (folder, output, options = {}) ->

	options = {
		minimize: true
		...options
	}

	files = await getAllFiles.async.array folder
	files = files.filter (file) ->
		return switch path.extname file
			when '.txt' then false
			when '.map' then false
			else true

	zip = new JSZip

	for sourceFile in files
		fileName = sourceFile.replace folder, ''
		zip.file fileName, fs.createReadStream sourceFile

	# console.log files

	# for key, source of files
	# 	source = path.join process.cwd(), source
	# 	list = await getAllFiles.async.array source
	# 	# console.log key
	# 	# console.log source
	# 	# console.log list
	# 	for sourceFile in list
	# 		file = sourceFile.replace source, ''
	# 		file = path.join key, file

	# 		zip.file file, fs.createReadStream sourceFile

	# 	# 	console.log 'file', file
	# 	# 	# source

	params = {
		streamFiles: true
	}

	if options.minimize
		params = {
			...params
			compression: 'DEFLATE'
			compressionOptions: {
				level: 9
			}
		}

	length 			= 0
	lengthStream	= LengthStream (result) -> length = result
	source			= zip.generateNodeStream params
	destination 	= fs.createWriteStream output

	return new Promise (resolve, reject) ->
		pipeline source, lengthStream, destination, (error) ->
			if error
				reject error
				return

			resolve length

# import { createReadStream, createWriteStream }	from 'fs'
# import { createGzip }							from 'zlib'
# import { pipeline }								from 'stream'
# import LengthStream								from 'length-stream'

# export default (input, output) ->

# 	gzip			= createGzip()
# 	source			= createReadStream input
# 	destination 	= createWriteStream output

# 	length 			= 0
# 	lengthStream	= LengthStream (result) -> length = result

# 	return new Promise (resolve, reject) ->
# 		pipeline source, gzip, lengthStream, destination, (error) ->
# 			if error
# 				reject error
# 				return

# 			resolve length
