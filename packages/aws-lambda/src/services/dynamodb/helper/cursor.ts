export const fromCursor = (cursor) => {
	if(cursor) {
		return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'))
	}
}

export const toCursor = (value) => {
	if(value) {
		return Buffer.from(JSON.stringify(value), 'utf-8').toString('base64')
	}
}
