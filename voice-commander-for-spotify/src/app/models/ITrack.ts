import { IImage } from './IImage';

export interface ITrack {
	id: string;
	uri: string;
	name: string;
	artists: Array<{ id: string, name: string }>;
	album: {
		id: string,
		name: string,
		images: IImage[]
	};
}
