import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	constructor (
		private router: Router,
		private userService: UserService
	) { }

	ngOnInit (): void {
		this.userService.getUser().subscribe(
			data => {
				if (data.valid && !data.user)
					this.router.navigate(["login"]);
			}
		);
	}
}
