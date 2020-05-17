export interface ILanguage {
	code: string;
	hotkey: string;
	hotword: string;
	match_full_cmd: boolean;
	require_hotword_for_play: boolean;
	play_cmd: string[];
	stop_cmd: string[];
	next_cmd: string[];
	previous_cmd: string[];
	repeat_cmd: string[];
	artist_separators: string[];
	album_separators: {
		separators: string[];
		album: string[];
	}
	add_cmd: string[];
	random_cmd: string[];
	enable_cmd: string[];
	disable_cmd: string[];
}
