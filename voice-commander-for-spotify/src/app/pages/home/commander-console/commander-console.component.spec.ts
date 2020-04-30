import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommanderConsoleComponent } from './commander-console.component';

describe('CommanderConsoleComponent', () => {
	let component: CommanderConsoleComponent;
	let fixture: ComponentFixture<CommanderConsoleComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CommanderConsoleComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CommanderConsoleComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
