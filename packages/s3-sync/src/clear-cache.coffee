
import AWS from 'aws-sdk'

export clearCache = ({ profile }) ->

	credentials = new AWS.SharedIniFileCredentials {
		profile
	}

	cloudfront = new AWS.CloudFront {
		apiVersion: '2019-03-26'
		credentials
	}

	data = await cloudfront.listDistributions().promise()

	for distribution from data.DistributionList.Items
		await cloudfront.createInvalidation {
			DistributionId: distribution.Id
			InvalidationBatch: {
				CallerReference: String Date.now()
				Paths: {
					Quantity: 1
					Items: [ '/*' ]
				}
			}
		}
		.promise()
