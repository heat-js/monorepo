
import AWS			from 'aws-sdk'
import Credentials	from './credentials'

export default ({ profile, region }) ->

	return new AWS.CloudFormation {
		apiVersion: '2010-05-15'
		credentials: Credentials { profile }
		region
	}
