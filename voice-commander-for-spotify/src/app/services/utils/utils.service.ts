import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class UtilsService {
	constructor () {}

	getErrorHandler (errorTitle: string = "Erro!"): (err: any) => void {
		return (err: any) => {
			if (err.error)
				err = err.error;

			Swal.fire({
				type: "error",
				title: errorTitle,
				text: err.message || "Unexpected error!",
				confirmButtonColor: "#3C58BF"
			});
			console.error(err);
		}
	}
}
