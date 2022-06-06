
export const signUpCommand = async ({ client, username, password, attributes = {} }) => {
	await client.call('SignUp', {
		ClientId: client.getClientId(),
		Username: username,
		Password: password,
		UserAttributes: Object.entries(attributes).map(([key, value]) => {
			return { Name: key, Value: value };
		})
	});
};
