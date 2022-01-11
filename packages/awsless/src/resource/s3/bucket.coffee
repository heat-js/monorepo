
import sync				from '@heat/s3-deploy/sync'
import path				from 'path'
import filesize 		from 'filesize'
import { paramCase }	from 'change-case'
import resource 		from '../../feature/resource'
import isDirectory		from '../../feature/fs/is-directory'
import emptyBucket		from '../../feature/s3/empty-bucket'
import { run }			from '../../feature/terminal/task'
import time				from '../../feature/performance/time'
# import output			from './output'

export default resource (ctx) ->

	region				= ctx.string '@Config.Region'
	profile				= ctx.string '@Config.Profile'
	Stack 				= ctx.string '@Config.Stack'
	BucketName			= ctx.string [ 'BucketName', 'Name' ]
	AccessControl		= ctx.string 'AccessControl', 'Private'

	# -------------------------------------------------------
	# Make the s3 bucket

	ctx.addResource ctx.name, {
		Type: 'AWS::S3::Bucket'
		Properties: {
			BucketName
			AccessControl
			PublicAccessBlockConfiguration: {
				BlockPublicAcls:		ctx.boolean 'Block.Acls',		true
				BlockPublicPolicy:		ctx.boolean 'Block.Policy',		true
				IgnorePublicAcls:		ctx.boolean 'Block.Ignore',		true
				RestrictPublicBuckets:	ctx.boolean 'Block.Restrict',	true
			}
		}
	}

	# -------------------------------------------------------
	# Events before stack deploy

	ctx.on 'validate-resource', ->
		folder = ctx.string 'Syncing.Folder', ''
		if not folder
			return

		folder = path.join process.cwd(), folder

		if not await isDirectory folder
			throw new Error "S3 Bucket folder doesn't exist: #{ folder }"

	# -------------------------------------------------------
	# Events after stack deploy

	ctx.on [ 'after-deploying-stack', 'sync' ], ->

		folder = ctx.string 'Syncing.Folder', ''
		if not folder
			return

		folder = path.join process.cwd(), folder
		await run (task) ->
			elapsed = time()

			task.setPrefix 'S3 Bucket'
			task.setName BucketName
			task.setContent 'Syncing...'

			await sync {
				profile
				region
				folder
				bucket:					BucketName
				ignoredExtensions:		ctx.array 'Syncing.IgnoreExtensions', []
				acl:					paramCase ctx.string [ 'Syncing.AccessControl', 'AccessControl' ], 'Private'
				cacheAge:				ctx.number 'CacheAge', 31536000
				logging: 				false
			}

			task.setContent 'Synced'
			task.addMetadata 'Time', elapsed()

	# -------------------------------------------------------
	# Events before stack delete

	ctx.on 'before-deleting-stack', ->
		await run (task) ->
			elapsed = time()

			task.setPrefix 'S3 Bucket'
			task.setName BucketName
			task.setContent 'Emptying...'

			{ size, count } = await emptyBucket {
				profile
				region
				bucket: BucketName
			}

			task.setContent 'Emptied'
			task.addMetadata 'Files', count
			task.addMetadata 'Size', filesize size
			task.addMetadata 'Time', elapsed()
