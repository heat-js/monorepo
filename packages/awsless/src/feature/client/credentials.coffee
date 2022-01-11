
import AWS from 'aws-sdk'

export default ({ profile }) ->

	return new AWS.SharedIniFileCredentials { profile }

	# chain = new AWS.CredentialProviderChain()

	# if profile
	# 	chain.providers.push new AWS.SharedIniFileCredentials { profile }

	# return chain
