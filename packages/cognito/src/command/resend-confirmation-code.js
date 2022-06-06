
export const resendConfirmationCodeCommand = ({ client, username }) => {
	return client.call('ResendConfirmationCode', {
		ClientId: client.getClientId(),
		Username: username,
	});
};
