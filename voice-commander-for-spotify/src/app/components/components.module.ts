import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { HeaderComponent } from './header/header.component';
import { VisualValidatorComponent } from './visual-validator/visual-validator.component';

@NgModule({
	declarations: [
		HeaderComponent,
		VisualValidatorComponent
	],
	imports: [
		BsDropdownModule.forRoot(),
		CommonModule,
		RouterModule
	],
	exports: [
		HeaderComponent,
		VisualValidatorComponent
	]
})
export class ComponentsModule { }
