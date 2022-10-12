
import sharp from 'sharp'

export const optimizeImages = (file, types) => {
	const image = sharp(file.path);

	return types.map(fn => fn({
		file,
		image: image.clone(),
	})).flat(Infinity);
}

export const saveImage = (image, outputFile) => {
	return image.toFile(outputFile);
}
