import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { IUserPreferences } from 'src/app/models/IUserPreferences';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
	constructor (private http: HttpClient) { }

	getUsersPreferences (): Observable<IUserPreferences> {
		return this.http.get<IUserPreferences>(`${environment.apiURL}/v1/preferences/user`);
	}
}
