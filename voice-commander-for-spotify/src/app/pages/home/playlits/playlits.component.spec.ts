import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylitsComponent } from './playlits.component';

describe('PlaylitsComponent', () => {
	let component: PlaylitsComponent;
	let fixture: ComponentFixture<PlaylitsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PlaylitsComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PlaylitsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
