import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { UserService } from '../user/user.service';

@Injectable({ providedIn: 'root' })
export class UtilsService {
	constructor (
		private router: Router,
		private userService: UserService
	) {}

	getErrorHandler (errorTitle: string = "Erro!", suppressUnauthorized: boolean = false): (err: any) => void {
		return (err: any) => {
			if (suppressUnauthorized && err.status === 401)
				return;

			if (err.error) {
				err = err.error;

				if (err.statusCode === 401 && err.name === "WebapiError") {
					// Login expired
					this.userService.logout().subscribe(
						_ => this.router.navigate(["login"], { queryParams: { expired: true } }),
						this.getErrorHandler("Error on logout")
					);
					return;
				}
			}

			console.error(err);
			Swal.fire({
				type: "error",
				title: errorTitle,
				text: err.message || "Unexpected error!",
				confirmButtonColor: "#3C58BF"
			});
		}
	}
}
