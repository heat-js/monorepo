
export class GraphQLError extends Error {

	constructor(errors) {
		super(errors[0].message);
		this.errors = errors;
	}
}
