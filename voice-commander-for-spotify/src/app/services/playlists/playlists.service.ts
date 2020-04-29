import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { IPlaylist } from 'src/app/models/IPlaylist';

@Injectable({ providedIn: 'root' })
export class PlaylistsService {
	constructor (private http: HttpClient) { }

	getUserPlaylists (): Observable<IPlaylist[]> {
		return this.http.get<IPlaylist[]>(`${environment.apiURL}/v1/playlists`);
	}
}
