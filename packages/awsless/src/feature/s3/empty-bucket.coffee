
import Client 	from '../client/s3'
import log		from '../terminal/log'

export default ({ profile, region, bucket }) ->

	s3		= Client { profile, region }
	count	= 0
	size	= 0

	while true
		result = await s3.listObjectsV2 { Bucket: bucket }
			.promise()

		if not result
			log.warning 'Bucket not found!'
			break

		files = result.Contents or []

		if files.length is 0
			break

		result = await s3.deleteObjects {
			Bucket: bucket
			Delete: {
				Objects: files.map ({ Key }) -> { Key }
				Quiet: true
			}
		}
		.promise()

		for file in files
			count++
			size += file.Size

	return {
		count
		size
	}
