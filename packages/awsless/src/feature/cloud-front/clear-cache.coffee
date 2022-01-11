
import CloudFront from '../client/cloudfront'

export default ({ profile, region, distributionId }) ->

	cloudfront = CloudFront {
		profile
		region
	}

	await cloudfront.createInvalidation {
		DistributionId: distributionId
		InvalidationBatch: {
			CallerReference: String Date.now()
			Paths: {
				Quantity: 1
				Items: [ '/*' ]
			}
		}
	}
	.promise()
