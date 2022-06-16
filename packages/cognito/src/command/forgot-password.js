
export const forgotPasswordCommand = (client, { username }) => {
	return client.call('ForgotPassword', {
		ClientId: client.getClientId(),
		Username: username,
	});
};
