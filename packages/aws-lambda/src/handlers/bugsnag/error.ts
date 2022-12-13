import { getStackString, parseStack } from './stacktrace.js'

const objectToString = Object.prototype.toString
const getPrototypeOf = Object.getPrototypeOf
const ERROR_TYPE = '[object Error]'

export function isObject(a: unknown): a is Record<string, any> {
	return typeof a === 'object' && a !== null && !Array.isArray(a)
}

export function isError(a: unknown): a is Error {
	if (a instanceof Error) {
		return true
	}

	let err = a
	while (err) {
		if (objectToString.call(err) === ERROR_TYPE) {
			return true
		}
		err = getPrototypeOf(err)
	}

	return false
}

export function normalizeError(maybeError: unknown): Error {
	if (isError(maybeError)) {
		return maybeError
	}

	let error = fromSimpleError(maybeError)
	if (error) {
		return error
	}

	switch (typeof error) {
	case 'string':
	case 'number':
	case 'boolean':
		return new Error(String(maybeError))
	}

	error = new Error('Received a non-error.')
	error.name = 'InvalidError'
	return error
}

export function fromSimpleError(error: unknown): Error | null {
	if (!isObject(error)) {
		return null
	}

	const getStringMember = (field: string) =>
		typeof error[field] === 'string' && error[field].length
			? error[field]
			: undefined

	const name = getStringMember('name') || getStringMember('errorClass')
	const message = getStringMember('message') || getStringMember('errorMessage')
	if (!name || !message) {
		return null
	}

	const newError = new Error(message)
	newError.name = name
	return newError
}

export function toException(maybeError: unknown)
{
	const error = normalizeError(maybeError)
	const stack = getStackString(error)

	return {
		errorClass: error.name,
		message: error.message,
		stacktrace: stack && parseStack(stack),
		type: 'nodejs'
	}
}
