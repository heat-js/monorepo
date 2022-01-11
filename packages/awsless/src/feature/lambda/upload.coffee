

import Client				from '../client/s3'
import path					from 'path'
# import build				from './build'
import createHash 			from '../crypto/hash-file'
import createChecksum 		from '../crypto/checksum'
import zip 					from '../fs/zip-files'
import { createReadStream }	from 'fs'
# import { task, warn }		from '../console'
import { run }				from '../terminal/task'
import time					from '../performance/time'
import throttle				from '../performance/throttle'
import uploadSourceMap		from '../bugsnag/upload-source-map'
import filesize 			from 'filesize'
import chalk				from 'chalk'
import createFileChecksum	from 'hash-then'
# import Worker				from 'jest-worker'
import { spawn, Thread, Worker } from "threads"


build = (input, output, options) ->
	worker = await spawn new Worker './build'

	try
		result = await worker.build input, output, options

	catch error
		throw error

	finally
		await Thread.terminate worker

	return result

# worker = new Worker require.resolve './build.js'

# const myWorker = new JestWorker(require.resolve('./Worker'), {
#     exposedMethods: ['foo', 'bar', 'getWorkerId'],
#     numWorkers: 4,
#   });

#   console.log(await myWorker.foo('Alice')); // "Hello from foo: Alice"
#   console.log(await myWorker.bar('Bob')); // "Hello from bar: Bob"
#   console.log(await myWorker.getWorkerId()); // "3" ->

# build = (inputFile, outputFile, options) ->
# 	new Worker
# 	# dir = path.join __dirname, './build'
# 	# worker = new Worker '../', { workerData: {num: 5}});

getObject = ({ region, profile, bucket, key }) ->

	s3 = Client { profile, region }

	try
		result = await s3.headObject {
			Bucket: bucket
			Key:	key
		}
		.promise()

	catch error
		if error.code is 'NotFound'
			return

		throw error

	return {
		metadata:	result.Metadata
		version:	result.VersionId
	}

export default ({ profile, region, bucket, name, stack, handle, externals = [], files = {}, policyChecksum = '', bugsnagApiKey, webpackConfig = {} }) ->

	root = process.cwd()

	file = handle
	file = file.substr 0, file.lastIndexOf '.'
	file = path.join root, file

	outputPath		= path.join root, '.awsless', 'lambda', name
	uncompPath		= path.join outputPath, 'uncompressed'
	compPath		= path.join outputPath, 'compressed'

	uncompFile		= path.join uncompPath, "#{ name }.js"
	compFile		= path.join compPath,	"#{ name }.js"
	uncompZipFile	= path.join uncompPath, 'index.zip'
	zipFile 		= path.join compPath,	'index.zip'
	key				= "#{ stack }/#{ name }.zip"
	elapsed 		= time()

	return run (task) ->
		task.setPrefix 'Lambda'
		task.setName "#{ name }.zip"
		task.setContent 'Waiting...'

		return throttle ->
			task.setContent 'Checking...'

			await build file, uncompFile, {
				externals
				minimize: false
				webpackConfig
			}

			object		= await getObject { profile, region, bucket, key }
			checksum	= await createFileChecksum uncompPath
			checksum 	= createChecksum [ checksum, policyChecksum ]
			# checksum 	= checksum.substr 0, 16

			if object and object.metadata.checksum is checksum
				task.warning()
				task.setContent 'Unchanged'
				task.addMetadata 'Time', elapsed()

				return { key, checksum, hash: object.metadata.hash, version: object.version, changed: false }

			task.setContent 'Building...'

			await build file, compFile, {
				externals
				minimize: true
				webpackConfig
			}

			size = await zip compPath, zipFile
			hash = await createHash 'sha256', zipFile, 'base64'

			s3 = Client { profile, region }

			task.setContent 'Uploading to S3...'
			task.addMetadata 'Size', filesize size

			result = await s3.putObject {
				Bucket: 		bucket
				Key:			key
				ACL:			'private'
				Body:			createReadStream zipFile
				StorageClass:	'STANDARD'
				Metadata: {
					checksum
					hash
				}
			}
			.promise()

			if bugsnagApiKey
				task.setContent 'Uploading source map to Bugsnag...'
				await uploadSourceMap {
					apiKey: bugsnagApiKey
					name
				}

			task.setContent 'Uploaded to S3'
			task.addMetadata 'Time', elapsed()

			return { key, checksum, hash, version: result.VersionId, changed: true }
