import { TestBed } from '@angular/core/testing';

import { HotwordsService } from './hotwords.service';

describe('HotwordsService', () => {
	let service: HotwordsService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(HotwordsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
