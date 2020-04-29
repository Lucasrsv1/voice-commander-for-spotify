import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { IPlaylist } from 'src/app/models/IPlaylist';
import { PlaylistsService } from 'src/app/services/playlists/playlists.service';
import { UserService } from 'src/app/services/user/user.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	public playlists: IPlaylist[] = [];
	public isCollapsed: boolean = false;
	public isConsoleCollapsed: boolean = false;

	private subscription: Subscription = null;

	constructor (
		private router: Router,
		private playlistsService: PlaylistsService,
		private userService: UserService,
		private utils: UtilsService
	) { }

	ngOnInit (): void {
		this.subscription = this.userService.getUser().subscribe(
			data => {
				if (data.valid && !data.user)
					this.router.navigate(["login"]);
			}
		);

		this.playlistsService.getUserPlaylists().subscribe(
			(playlists: IPlaylist[]) => this.playlists = playlists,
			this.utils.getErrorHandler("Error obtaining your playlists", true)
		);
	}

	ngOnDestroy () {
		this.subscription.unsubscribe();
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

	onSwitchChange (): void {
		// TODO: update user's preference
	}
}
