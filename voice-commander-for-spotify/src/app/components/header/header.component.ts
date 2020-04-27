import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";

import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
	public user$: Observable<string>;
	public currentPage: string;

	constructor (
		private utils: UtilsService,
		private router: Router
	) {
		this.user$ = new Observable(observer => {
			setTimeout(() => {
				observer.next("Lucas");
			}, 5000);
		});
	}

	userName (user: string): string {
		return user;
	}

	logout (): void {
		this.router.navigate(["login"]);
	}
}
