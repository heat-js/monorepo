
type Lambdas = {
	[key: string]: (payload:unknown) => unknown
}

interface LambdaOptions {
	service: string
	name: string
	payload?: unknown
}

export const createLambdaMock = (lambdas:Lambdas) => {
	return {
		async invoke({ service, name, payload }:LambdaOptions) {
			if(name && service) {
				name = `${ service }__${ name }`
			}

			const callback = lambdas[ name ]
			if(!callback) {
				throw new TypeError(`Lambda mock function not defined for: ${ name }`)
			}

			return callback(payload)
		}
	}
}
