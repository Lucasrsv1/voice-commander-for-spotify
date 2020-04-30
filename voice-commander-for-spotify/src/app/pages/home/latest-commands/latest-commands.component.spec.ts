import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestCommandsComponent } from './latest-commands.component';

describe('LatestCommandsComponent', () => {
	let component: LatestCommandsComponent;
	let fixture: ComponentFixture<LatestCommandsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LatestCommandsComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LatestCommandsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
