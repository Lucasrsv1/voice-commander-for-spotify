export interface ITrack {
	album: { id: string, name: string };
	artists: Array<{ id: string, name: string }>;
	id: string;
	name: string;
}
