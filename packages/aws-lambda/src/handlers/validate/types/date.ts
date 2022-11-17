
import { coerce, date as sdate, string } from 'superstruct'

export const date = () => {
	return coerce(sdate(), string(), (value) => {
		return new Date(value)
	})
}
