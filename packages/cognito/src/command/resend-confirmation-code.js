
export const resendConfirmationCode = async ({ client, username }) => {
	await client.call('ResendConfirmationCode', {
		ClientId: client.getClientId(),
		Username: username,
	});
};
