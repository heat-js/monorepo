import { create, Struct, validate } from '../../services/validate'

export const defaultTransformer = () => ({
	input(object, struct:Struct): any {
		return validate(object, struct)
	},
	output(object, struct:Struct): any {
		return create(object, struct)
	}
})
