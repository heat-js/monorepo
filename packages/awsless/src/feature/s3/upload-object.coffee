
import fs		from 'fs'
import path		from 'path'
import mime 	from 'mime-types'
import Client 	from '../client/s3'

export default ({ profile, region, bucket, key, file, acl = 'private', cacheAge = 31536000 }) ->

	s3	= Client { profile, region }
	ext	= path.extname file

	cacheControl = switch mime.lookup ext
		when false, 'text/html', 'application/json', 'application/manifest+json', 'application/manifest', 'text/markdown'
			's-maxage=31536000, max-age=0'
		else
			"public, max-age=#{ cacheAge }, immutable"

	body = await fs.promises.readFile file

	await s3.putObject {
		ACL:			acl
		Bucket: 		bucket
		Body:			body
		Key:			key
		CacheControl:	cacheControl
		ContentType:	mime.contentType(ext) or 'text/html; charset=utf-8'
	}
	.promise()
