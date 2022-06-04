
export const confirmSignUpCommand = async ({ client, store, username, code, forceAliasCreation }) => {
	// const session = await sessionCommand({ client, store });

	await client.call('ConfirmSignUp', {
		ClientId: client.getClientId(),
		Username: username,
		ConfirmationCode: code,
		ForceAliasCreation: forceAliasCreation,
	});
};
