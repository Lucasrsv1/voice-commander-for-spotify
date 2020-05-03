import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ITrack } from 'src/app/models/ITrack';

export interface ISongParams {
	song: string;
	artist?: string;
	album?: string;
	separator?: string;
}

@Injectable({ providedIn: 'root' })
export class PlaybackService {
	constructor (private http: HttpClient) { }

	playSong (params: ISongParams): Observable<ITrack[]> {
		return this.http.post<ITrack[]>(`${environment.apiURL}/v1/playback/play`, params);
	}
}
