
import AWS			from 'aws-sdk'
import Credentials	from './credentials'

export default ({ profile, region }) ->

	return new AWS.CloudFront {
		apiVersion: '2019-03-26'
		credentials: Credentials { profile }
		region
	}
