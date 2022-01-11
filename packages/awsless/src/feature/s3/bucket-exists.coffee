

import Client from '../client/s3'

export default ({ profile, region, bucket }) ->

	s3 = Client { profile, region }

	result = await s3.getBucketLocation {
		Bucket: bucket
	}
	.promise()

	return !!result.LocationConstraint
