import { IImage } from './IImage';

export interface IPlaylist {
	not_ignored: boolean;
	collaborative: boolean;
	description: string;
	external_urls: { spotify: string };
	href: string;
	id: string;
	images: IImage[];
	name: string;
	owner: {
		display_name: string,
		external_urls: { spotify: string },
		href: string,
		id: string,
		type: string,
		uri: string
	};
	primary_color: string;
	public: boolean;
	snapshot_id: string;
	tracks: {
		href: string,
		total: number
	};
	type: string;
	uri: string;
}
