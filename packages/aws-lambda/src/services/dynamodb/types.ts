
export type Expression = {
	expression: string
	names:{ [key:string]: string }
	values:{ [key:string]: string }
}

export type Key = { [ key: string ]: string | number }
// export type Value = string | number | boolean | null | undefined
export type Value = string | number | boolean | null | undefined | Value[] | { [key:string]:Value }
export type Item = { [ key: string ]: Value | Item | [ Value | Item ] }
