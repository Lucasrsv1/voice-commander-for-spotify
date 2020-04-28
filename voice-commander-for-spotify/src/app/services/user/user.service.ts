import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { IUser } from 'src/app/models/IUser';

@Injectable({ providedIn: 'root' })
export class UserService {
	private gettingUser: boolean = false;
	private userSubject = new BehaviorSubject<{ user: IUser, valid: boolean }>({ user: null, valid: false });

	constructor (private http: HttpClient) { }

	getUser (): Observable<{ user: IUser, valid: boolean }> {
		if (!this.userSubject.value.user && !this.gettingUser) {
			this.gettingUser = true;
			this.http.get<IUser>(`${environment.apiURL}/v1/login/user`).pipe(
				tap((user: IUser) => {
					this.userSubject.next({ user: user, valid: true });
					this.gettingUser = false;
				})
			).subscribe();
		}

		return this.userSubject.asObservable();
	}

	logout (): Observable<boolean> {
		this.userSubject.next({ user: null, valid: false });
		return this.http.get<boolean>(`${environment.apiURL}/v1/logout`);
	}
}
