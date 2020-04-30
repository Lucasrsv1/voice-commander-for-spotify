import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { IPlaylist } from 'src/app/models/IPlaylist';
import { PlaylistsService } from 'src/app/services/playlists/playlists.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'app-playlists',
	templateUrl: './playlists.component.html',
	styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {
	public loading: boolean = false;
	public savedPlaylists: IPlaylist[] = [];
	public playlists: IPlaylist[] = [];

	private triggerSave: Subject<any> = new Subject<any>();

	constructor (
		private playlistsService: PlaylistsService,
		private utils: UtilsService
	) { }

	ngOnInit (): void {
		this.getPlaylists();
		this.triggerSave.pipe(debounceTime(1000))
						.subscribe(this.saveSettings.bind(this));
	}

	getPlaylists (): void {
		this.loading = true;
		this.playlistsService.getUserPlaylists().subscribe(
			(playlists: IPlaylist[]) => {
				this.playlists = playlists;
				this.savedPlaylists = this.utils.cloneObj(this.playlists);
			},
			this.utils.getErrorHandler("Error obtaining your playlists"),
			() => { this.loading = false; }
		);
	}

	getImg (playlist: IPlaylist): string {
		let image = playlist.images[0];
		for (let i = 0; i < playlist.images.length; i++) {
			if (image.height <= 128) {
				if (playlist.images[i].height <= 128 && playlist.images[i].height > image.height)
					image = playlist.images[i];
			} else if (playlist.images[i].height <= image.height) {
				image = playlist.images[i];
			}
		}

		return image ? image.url : "";
	}

	onSettingsChange (): void {
		this.triggerSave.next();
	}

	saveSettings (): void {
		if (this.utils.equals(this.savedPlaylists, this.playlists))
			return;

		let toIgnore = [];
		let searchOrder = [];
		for (let playlist of this.playlists) {
			if (!playlist.not_ignored)
				toIgnore.push(playlist.id);
			else
				searchOrder.push(playlist.id);
		}

		this.playlistsService.updateUserPlaylists(toIgnore, searchOrder).subscribe(
			_ => this.savedPlaylists = this.utils.cloneObj(this.playlists),
			this.utils.getErrorHandler("Erro saving playlists settings")
		);
	}
}
