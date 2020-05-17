import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { IUserPreferences } from 'src/app/models/IUserPreferences';
import { IValidations } from 'src/app/components/visual-validator/visual-validator.component';

import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
	selector: 'app-preferences',
	templateUrl: './preferences.component.html',
	styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
	public form: FormGroup;
	public validations: IValidations;
	public preferences: IUserPreferences;

	constructor (
		private formBuilder: FormBuilder,
		private preferencesService: PreferencesService,
		private utils: UtilsService
	) {
		this.form = this.formBuilder.group({
			app_language: new FormControl("", Validators.required),

			// Hotkeys
			start_listening: new FormControl("", Validators.required),
			toggle_languages: new FormControl("", Validators.required)
		});

		this.validations = {
			form: this.form,
			fields: {
				app_language: [{ key: "required" }],

				// Hotkeys
				start_listening: [{ key: "required" }],
				toggle_languages: [{ key: "required" }]
			}
		};
	}

	ngOnInit (): void {
		this.preferencesService.getUsersPreferences().subscribe(
			(preferences: IUserPreferences) => {
				this.preferences = preferences;
				console.log(this.preferences);

				// Fill form with current values
				this.form.get("app_language").setValue(this.preferences.app_language);

				// Hotkeys
				this.form.get("start_listening").setValue(this.preferences.hotkeys.start_listening);
				this.form.get("toggle_languages").setValue(this.preferences.hotkeys.toggle_languages);
			},
			this.utils.getErrorHandler("Error getting user's preferences")
		);
	}

	getHotkey (field: string) {
		this.form.get(field).setValue("");
	}

	savePreferences (): void { }
}
