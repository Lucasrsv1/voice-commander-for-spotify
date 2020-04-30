import { TestBed } from '@angular/core/testing';

import { VoiceCommanderService } from './voice-commander.service';

describe('VoiceCommanderService', () => {
	let service: VoiceCommanderService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(VoiceCommanderService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
