
import Client from '../client/s3'

export default ({ profile, region, bucket, key }) ->

	s3 = Client { profile, region }

	result = await s3.deleteObject {
		Bucket: bucket
		Key: key
	}
	.promise()
