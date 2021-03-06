import { NgModule } from '@angular/core';
import { HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SortableModule } from 'ngx-bootstrap/sortable';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { AppRoutingModule } from './app-routing.module';
import { ErrorsModule } from './errors/errors.module';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';

import { HomeComponent } from './pages/home/home.component';
import { CommanderConsoleComponent } from './pages/home/commander-console/commander-console.component';
import { LatestCommandsComponent } from './pages/home/latest-commands/latest-commands.component';
import { PlaylistsComponent } from './pages/home/playlists/playlists.component';
import { PreferencesComponent } from './pages/home/preferences/preferences.component';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		LoginComponent,
		PlaylistsComponent,
		CommanderConsoleComponent,
		LatestCommandsComponent,
		PreferencesComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		ErrorsModule,
		ComponentsModule,
		BsDropdownModule.forRoot(),
		TabsModule.forRoot(),
		SortableModule.forRoot(),
		CollapseModule.forRoot(),
		SweetAlert2Module.forRoot(),
		UiSwitchModule,
		HttpClientModule,
		AppRoutingModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
