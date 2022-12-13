
import { Next, Request } from '../../types'

interface IConfiguration {
	(): object
}

/**
 * Middleware for defining your app config.
 * @param configuration - A callback to generate the config object.
 */
export const config = (configuration: IConfiguration) => {
	return ({ $ }: Request, next: Next) => {
		$.config = () => {
			return configuration()
		}

		return next()
	}
}
