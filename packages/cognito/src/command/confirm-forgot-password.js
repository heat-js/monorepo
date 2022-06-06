
export const confirmForgotPasswordCommand = ({ client, username, password, code }) => {
	return client.call('ConfirmForgotPassword', {
		ClientId: client.getClientId(),
		Username: username,
		Password: password,
		ConfirmationCode: code,
	});
};
