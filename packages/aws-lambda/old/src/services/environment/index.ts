
import { test } from '../../helper'

export const get = (name:string, defaultValue:any, defaultTestingValue:any):any => {
	const value = process.env[name]

	if(typeof value !== 'undefined') {
		return value
	}

	if(typeof defaultValue !== 'undefined') {
		return defaultValue
	}

	if(test()) {
		return defaultTestingValue
	}

	throw new TypeError(`Environment variable "${name}" hasn't been set.`)
}

export const string = (name:string, defaultValue?:string) => {
	return String(get(name, defaultValue, ''))
}

export const integer = (name:string, defaultValue?:number):number => {
	return parseInt(get(name, defaultValue, 0), 10)
}

export const float = (name:string, defaultValue?:number):number => {
	return parseFloat(get(name, defaultValue, 0))
}

export const boolean = (name:string, defaultValue?:boolean):boolean => {
	const value = get(name, defaultValue, false)

	if([true, 1, 'true', 'TRUE', 'yes', '1'].includes(value)) {
		return true
	}

	if([false, 0, 'false', 'FALSE', 'no', '0'].includes(value)) {
		return false
	}

	return !!value
}

export const array = (name:string, defaultValue?:[], sep:string = ','):String[] => {
	const value = get(name, defaultValue, [])

	if(Array.isArray(value)) {
		return value.map(String)
	}

	if(typeof value === 'string') {
		return value.split(sep).map(item => String(item).trim())
	}

	throw new TypeError(`Environment variable "${name}" isn't an array.`)
}

export const json = (name:string, defaultValue?:any): any => {
	const value = get(name, defaultValue, {})

	if(typeof value === 'object' && value !== null) {
		return value
	}

	try {
		return JSON.parse(value)
	} catch(error) {
		throw new TypeError(`Environment variable "${ name }" isn't valid JSON.`)
	}
}

export const enumeration = (name:string, possibilities:string[], defaultValue?:string): string => {
	const value = get(name, defaultValue, '')

	if(!possibilities.includes(value)) {
		throw new TypeError(
			`Environment variable "${ name }" must contain one of the following values: ${possibilities.join(', ')}.`
		)
	}

	return value
}
