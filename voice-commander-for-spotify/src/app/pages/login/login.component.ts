import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user/user.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	public error: string;
	public logout: boolean;
	public loggingIn: boolean = false;
	public sec: number = 6;

	private destroyed: boolean = false;

	constructor (
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private userService: UserService,
		private utils: UtilsService
	) { }

	ngOnInit (): void {
		this.userService.getUser().subscribe(
			data => {
				if (data.valid && data.user) {
					this.router.navigate([""]);
					return;
				}

				this.error = this.activatedRoute.snapshot.queryParams["error"];
				this.logout = this.activatedRoute.snapshot.queryParams["logout"];

				if (!this.error && this.sec === 6 && !this.logout) {
					this.sec--;
					this.counter();
				}
			},
			this.utils.getErrorHandler("Error retrieving logged user")
		);
	}

	ngOnDestroy () {
		this.destroyed = true;
	}

	counter (): void {
		if (this.destroyed) return;

		this.sec--;
		if (this.sec <= 0)
			this.login();
		else
			setTimeout(this.counter.bind(this), 1000);
	}

	login (): void {
		this.loggingIn = true;
		window.location.href = environment.apiURL + "/v1/login";
	}
}
