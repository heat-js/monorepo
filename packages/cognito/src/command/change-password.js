
export const changePasswordCommand = async ({ client, store, previousPassword, proposedPassword }) => {
	const session = await sessionCommand({ client, store });

	await client.call('ChangePassword', {
		PreviousPassword: previousPassword,
		ProposedPassword: proposedPassword,
		AccessToken: session.accessToken.toString(),
	});
};
