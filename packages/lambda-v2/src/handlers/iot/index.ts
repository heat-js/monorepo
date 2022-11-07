
export { Iot } from "./iot"
import { Iot } from "./iot"

interface IotOptions {
	endpoint?: string
}

export const iot = ({ endpoint }:IotOptions = {}) => {
	return (app, next) => {
		app.$.iot = () => {
			return new Iot(endpoint || process.env.IOT_ENDPOINT);
		}

		return next();
	}
}
