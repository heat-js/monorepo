
import sync				from '@heat/s3-deploy/sync'
import path				from 'path'
import { paramCase }	from 'change-case'
import resource 		from '../../feature/resource'
import isFile			from '../../feature/fs/is-file'
import uploadObject		from '../../feature/s3/upload-object'
import deleteObject		from '../../feature/s3/delete-object'
import bucketExists		from '../../feature/s3/bucket-exists'
import { run }			from '../../feature/terminal/task'
import time				from '../../feature/performance/time'

export default resource (ctx) ->

	region		= ctx.string '@Config.Region'
	profile		= ctx.string '@Config.Profile'
	key			= ctx.string [ 'Key', 'Name' ]
	bucket		= ctx.string [ 'BucketName', 'Bucket' ]
	acl			= ctx.string 'AccessControl', 'Private'
	cacheAge	= ctx.number 'CacheAge', 31536000
	file		= ctx.string 'File'
	file		= path.join process.cwd(), file

	# -------------------------------------------------------
	# Events before stack deploy

	ctx.on 'validate-resource', ->
		if not await isFile file
			throw new Error "S3 Object file doesn't exist: #{ file }"

	# -------------------------------------------------------
	# Events after stack deploy

	ctx.on [ 'after-deploying-stack', 'sync' ], ->
		await run (task) ->
			elapsed = time()

			task.setPrefix 'S3 Object'
			task.setName key
			task.setContent 'Uploading...'

			if not await bucketExists { profile, region, bucket }
				throw new Error "S3 Bucket doesn't exist: #{ bucket }"

			task.setContent 'Uploading...'

			await uploadObject {
				profile
				region
				file
				key
				bucket
				cacheAge
				acl: paramCase acl
			}

			task.setContent 'Uploaded'
			task.addMetadata 'Time', elapsed()

	# -------------------------------------------------------
	# Events before stack delete

	ctx.on 'before-deleting-stack', ->
		await run (task) ->
			elapsed = time()

			task.setPrefix 'S3 Object'
			task.setName key
			task.setContent 'Deleting...'

			if not await bucketExists { profile, region, bucket }
				task.warning()
				task.setContent "S3 Bucket doesn't exist"
				task.addMetadata 'Time', elapsed()
				return

			await deleteObject {
				profile
				region
				bucket
				key
			}

			task.setContent 'Deleted'
			task.addMetadata 'Time', elapsed()
