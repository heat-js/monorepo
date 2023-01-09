
import { default as sync } 	from '@heat/s3-deploy/sync'
import path					from 'path'
import { paramCase }		from 'change-case'
import resource 			from '../../feature/resource'
import isFile				from '../../feature/fs/is-file'
import isDirectory			from '../../feature/fs/is-directory'
import listFilesRecursive	from '../../feature/fs/list-files-recursive'
import uploadObject			from '../../feature/s3/upload-object'
import deleteObject			from '../../feature/s3/delete-object'
import bucketExists			from '../../feature/s3/bucket-exists'
import { run }				from '../../feature/terminal/task'
import time					from '../../feature/performance/time'

export default resource (ctx) ->

	region		= ctx.string '@Config.Region'
	profile		= ctx.string '@Config.Profile'
	bucket		= ctx.string [ 'BucketName', 'Bucket' ]
	acl			= ctx.string 'AccessControl', 'Private'
	cacheAge	= ctx.number 'CacheAge', 31536000
	path		= ctx.string 'DestinationPath'
	folder		= ctx.string 'UploadFolder'
	folder		= path.join process.cwd(), folder

	# -------------------------------------------------------
	# Events before stack deploy

	ctx.on 'validate-resource', ->
		if not await isDirectory file
			throw new Error "S3 image folder doesn't exist: #{ folder }"

	# -------------------------------------------------------
	# Events after stack deploy

	ctx.on [ 'after-deploying-stack', 'sync' ], ->
		await run (task) ->
			elapsed = time()

			task.setPrefix 'S3 Folder'
			task.setName folder
			task.setContent 'Optimizing...'

			images = await listFilesRecursive folder
			images

			quality


			# task.setContent 'Uploading...'

			# if not await bucketExists { profile, region, bucket }
			# 	throw new Error "S3 Bucket doesn't exist: #{ bucket }"

			# task.setContent 'Uploading...'

			# await uploadObject {
			# 	profile
			# 	region
			# 	file
			# 	key
			# 	bucket
			# 	cacheAge
			# 	acl: paramCase acl
			# }

			# task.setContent 'Uploaded'
			# task.addMetadata 'Time', elapsed()

	# -------------------------------------------------------
	# Events before stack delete

	# ctx.on 'before-deleting-stack', ->
	# 	await run (task) ->
	# 		elapsed = time()

	# 		task.setPrefix 'S3 Object'
	# 		task.setName key
	# 		task.setContent 'Deleting...'

	# 		if not await bucketExists { profile, region, bucket }
	# 			task.warning()
	# 			task.setContent "S3 Bucket doesn't exist"
	# 			task.addMetadata 'Time', elapsed()
	# 			return

	# 		await deleteObject {
	# 			profile
	# 			region
	# 			bucket
	# 			key
	# 		}

	# 		task.setContent 'Deleted'
	# 		task.addMetadata 'Time', elapsed()
