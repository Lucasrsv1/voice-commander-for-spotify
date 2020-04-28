import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";

import { IUser } from 'src/app/models/IUser';
import { UserService } from 'src/app/services/user/user.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
	public user$: Observable<IUser>;
	public currentPage: string;

	constructor (
		private router: Router,
		private userService: UserService,
		private utils: UtilsService
	) {
		this.user$ = new Observable<IUser>(ob => {
			this.userService.getUser().subscribe(
				data => ob.next(data.user)
			);
		});
	}

	userName (user: IUser): string {
		return user.display_name;
	}

	logout (): void {
		this.userService.logout().subscribe(
			_ => this.router.navigate(["login"], { queryParams: { logout: true } }),
			this.utils.getErrorHandler("Error on logout")
		);
	}
}
