import { ILanguage } from './ILanguage';

export interface IUserPreferences {
	app_language: string;
	languages: ILanguage[];
	hotkeys: {
		toggle_languages: string;
		start_listening: string;
	}
	ignored_playlists: string[];
	playlists_search_order: string[];
}
