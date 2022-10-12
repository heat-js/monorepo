
import { optimize } from '../src/index.js'
import { ValidationError } from '../src/helper/errors.js';
import fs from 'fs'

describe('optimize', () => {
	const config = {
		root: process.cwd() + '/test/data',
		input: './images',
		output: './build',
		types: ({ file, image }) => ([
			{
				image: image.clone().jpeg({ quality: 75, mozjpeg: true }),
				output: `${file.name}.jpeg`,
			},
			{
				image: image.clone().webp({ quality: 75, effort: 6 }),
				output: `${file.name}.webp`,
			}
		])
	};

	const removeBuildFiles = async () => {
		try {
			await fs.promises.rmdir(process.cwd() + '/test/data/build', { recursive: true });
		} catch (_) { }
	}

	beforeAll(removeBuildFiles);
	afterAll(removeBuildFiles);

	it('should optimize images', async () => {
		const result = await optimize(config);

		expect(result.processed).toBe(8);
		expect(result.inputs.length).toBe(5);
		expect(result.outputs.length).toBe(10);
		expect(result.errors.length).toBe(2);
	});

	it('should skip already cached image results', async () => {
		const result = await optimize(config);

		expect(result.processed).toBe(0);
	});

	it('should redo already cached image results if the output config changed', async () => {
		const result = await optimize({
			...config,
			types: ({ file, image }) => ([
				{
					image: image.clone().jpeg({ quality: 75, mozjpeg: true }),
					output: `${file.name}.jpeg`,
				},
				{
					image: image.clone().webp({ quality: 75, effort: 5 }),
					output: `${file.name}.webp`,
				}
			])
		});

		expect(result.processed).toBe(4);
	});

	it('should throw when multiple output images are the same. (Probably a config bug)', async () => {
		await expect(optimize({
			...config,
			types: ({ file, image }) => ([
				{
					image: image.jpeg({ quality: 75, mozjpeg: true }),
					output: `${file.name}.jpeg`,
				},
				{
					image: image.webp({ quality: 75, effort: 5 }),
					output: `${file.name}.webp`,
				}
			])
		})).rejects.toThrow(ValidationError);
	});

	it('should allow deep config structures', async () => {
		const result = await optimize({
			...config,
			types: [[({ file, image }) => ([[
				{
					image: image.jpeg({ quality: 75, mozjpeg: true }),
					output: `${file.name}.jpeg`,
				}
			]])]]
		});

		expect(result.processed).toBe(0);
	});
});
