import { ExtraMetaData } from '../../types'

export const console = () => {
	return async (error:any, metaData:ExtraMetaData = {}) => {
		globalThis.console.error(error, metaData)
	}
}
