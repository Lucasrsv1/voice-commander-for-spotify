import { Component, Input, ElementRef } from "@angular/core";
import { FormGroup, AbstractControl } from '@angular/forms';

export interface IValidations {
	form: FormGroup;
	fields: {
		[field: string]: Array<{
			key: string
			message?: string
		}>
	}
}

@Component({
	selector: "visual-validator",
	templateUrl: "./visual-validator.component.html",
	styleUrls: ['./visual-validator.component.scss']
})
export class VisualValidatorComponent {
	@Input("config")
	public config: IValidations;

	@Input("field")
	public field: string;

	private input: HTMLElement;

	constructor (private elementRef: ElementRef) { }

	ngAfterContentInit () {
		this.input = this.elementRef.nativeElement.childNodes[0];
		if (!this.input.classList.contains("form-control"))
			this.input.classList.add("form-field");
	}

	get formControl (): AbstractControl | { value: null, errors: null } {
		let control = this.config.form ? this.config.form.controls[this.field] : { value: null, errors: null };
		if (this.input) {
			if (this.controlIsDirty) {
				if (control.errors) {
					this.input.classList.add("is-invalid");
					this.input.classList.remove("is-valid");
				} else {
					this.input.classList.add("is-valid");
					this.input.classList.remove("is-invalid");
				}
			} else {
				this.input.classList.remove("is-valid", "is-invalid");
			}
		}

		return control;
	}

	get controlIsDirty (): boolean {
		let control = this.config.form ? this.config.form.controls[this.field] : { value: false };
		return this.input ? this.input.classList.contains("ng-dirty") ||
							this.input.classList.contains("ng-touched") ||
							Boolean(control.value) : false;
	}

	getDefaultMessage (key: string): string {
		switch (key) {
			case "required":
				return "This field is required";
			case "email":
				return "This field must be a valid email";
			case "min":
				return "This field must have a bigger value";
			case "max":
				return "This field must have a smaller value";
			case "minlength":
				return "This field must be larger";
			case "maxlength":
				return "This field must be shorter";
			default:
				return "Invalid value";
		}
	}
}
