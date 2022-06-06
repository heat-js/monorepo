
export const confirmSignUpCommand = ({ client, username, code, forceAliasCreation }) => {
	return client.call('ConfirmSignUp', {
		ClientId: client.getClientId(),
		Username: username,
		ConfirmationCode: code,
		ForceAliasCreation: forceAliasCreation,
	});
};
