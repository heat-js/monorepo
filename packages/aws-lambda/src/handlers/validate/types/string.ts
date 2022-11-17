
import { coerce, string } from 'superstruct'

export const lowercase = () => {
	return coerce(string(), string(), (value) => value.toLowerCase())
}

export const uppercase = () => {
	return coerce(string(), string(), (value) => value.toUpperCase())
}
