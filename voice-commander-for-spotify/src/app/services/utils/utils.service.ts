import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { IImage } from 'src/app/models/IImage';
import { UserService } from '../user/user.service';

@Injectable({ providedIn: 'root' })
export class UtilsService {
	constructor (
		private router: Router,
		private userService: UserService
	) {}

	private loginExpired (): void {
		this.userService.logout().subscribe(
			_ => this.router.navigate(["login"], { queryParams: { expired: true } }),
			this.getErrorHandler("Error on logout")
		);
	}

	getErrorHandler (errorTitle: string = "Erro!"): (err: any) => void {
		return (err: any) => {
			if (err.status === 401)
				return this.loginExpired();

			if (err.error) {
				err = err.error;
				if (err.statusCode === 401 && err.name === "WebapiError")
					return this.loginExpired();
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

	handlerError (errorTitle: string = "Erro!", error: any): void  {
		this.getErrorHandler(errorTitle)(error);
	}

	cloneObj<T> (obj: T, throwException: boolean = false): T {
		try {
			return JSON.parse(JSON.stringify(obj)) as T;
		} catch (error) {
			let exception = new Error("Only valid JSON like objects can be cloned!\n" + error.stack);
			if (throwException)
				throw exception;
			else
				console.error(exception);

			return null;
		}
	}

	equals (objA: any, objB: any, throwException: boolean = false): boolean {
		try {
			return JSON.stringify(objA) === JSON.stringify(objB);
		} catch (error) {
			let exception = new Error("Only valid JSON like objects can be compared!\n" + error.stack);
			if (throwException)
				throw exception;
			else
				console.error(exception);

			return null;
		}
	}

	getImg (images: IImage[]): string {
		let image = images[0];
		for (let i = 0; i < images.length; i++) {
			if (image.height <= 128) {
				if (images[i].height <= 128 && images[i].height > image.height)
					image = images[i];
			} else if (images[i].height <= image.height) {
				image = images[i];
			}
		}

		return image ? image.url : "";
	}
}
