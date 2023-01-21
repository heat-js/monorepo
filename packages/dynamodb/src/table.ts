
export class Table<Model extends object = any, Key extends object = any> {
	constructor(readonly name: string) {}

	toString() {
		return this.name
	}
}
