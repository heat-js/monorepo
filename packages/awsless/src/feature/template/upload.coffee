
import Client from '../client/s3'

export default ({ profile, region, stack, bucket, templateBody }) ->

	if 50000 > Buffer.byteLength templateBody, 'utf8'
		return

	if not bucket
		throw new Error '''
			Your cloudformation template file size is greater then 50kb.
			You need to set a "Config.DeploymentBucket" to handle bigger template files.
		'''

	s3 = Client { profile, region }

	result = await s3.putObject {
		Bucket: 		bucket
		Key:			"#{ stack }/cloudformation.json"
		ACL:			'private'
		Body:			templateBody
		StorageClass:	'STANDARD'
	}
	.promise()

	# "s3://#{ bucket }/#{ stack }/cloudformation.json"
	return "https://s3-#{ region }.amazonaws.com/#{ bucket }/#{ stack }/cloudformation.json"
