
import Client				from '../client/s3'
import path					from 'path'
import { createReadStream }	from 'fs'
import { run }				from '../terminal/task'
import time					from '../performance/time'
import chalk				from 'chalk'
import createChecksum		from 'hash-then'

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

export default ({ stack, profile, region, bucket, name, zip }) ->

	root	= process.cwd()
	file	= path.join root, zip
	key		= "#{ stack }/#{ name }-layer.zip"
	elapsed = time()

	return run (task) ->
		task.setPrefix 'Lambda Layer'
		task.setName "#{ name }-layer.zip"
		task.setContent 'Checking...'

		checksum	= await createChecksum file
		checksum 	= checksum.substr 0, 16
		object		= await getObject { profile, region, bucket, key }

		if object and object.metadata.checksum is checksum
			task.warning()
			task.setContent 'Unchanged'
			task.addMetadata 'Time', elapsed()

			return { key, version: object.version }

		task.setContent 'Uploading...'

		s3 = Client { profile, region }

		result = await s3.putObject {
			Bucket: 		bucket
			Key:			key
			ACL:			'private'
			Body:			createReadStream file
			StorageClass:	'STANDARD'
			Metadata: {
				checksum
			}
		}
		.promise()

		task.setContent 'Uploaded to S3'

		return { key, version: result.VersionId }
