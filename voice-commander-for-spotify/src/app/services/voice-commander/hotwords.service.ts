import { Injectable } from '@angular/core';

import { LogStatus } from './ICmdLog';

@Injectable({ providedIn: 'root' })
export class HotwordsService {
	constructor () { }

	evaluate (cmd: string): Promise<LogStatus> {
		return new Promise(resolve => {
			setTimeout(() => resolve(LogStatus.SUCCESS), 3000);
		});
	}
}
