import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	public isCollapsed: boolean = false;
	public isConsoleCollapsed: boolean = false;

	private subscription: Subscription = null;

	constructor (
		private router: Router,
		private userService: UserService
	) { }

	ngOnInit (): void {
		this.subscription = this.userService.getUser().subscribe(
			data => {
				if (data.valid && !data.user)
					this.router.navigate(["login"]);
			}
		);
	}

	ngOnDestroy () {
		this.subscription.unsubscribe();
	}
}
