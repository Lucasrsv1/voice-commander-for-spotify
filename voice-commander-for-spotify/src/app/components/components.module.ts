import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { HeaderComponent } from './header/header.component';

@NgModule({
	declarations: [HeaderComponent],
	imports: [
		BsDropdownModule.forRoot(),
		CommonModule,
		RouterModule
	],
	exports: [HeaderComponent]
})
export class ComponentsModule { }
