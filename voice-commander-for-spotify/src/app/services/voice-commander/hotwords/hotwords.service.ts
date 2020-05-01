import { Injectable } from '@angular/core';

import { LogStatus } from '../ICmdLog';
import { IHotword } from './IHotword';
import { StructuredCmd } from './StructuredCmd';

@Injectable({ providedIn: 'root' })
export class HotwordsService {
	private _triggerWord: string;
	private _registeredHotwords: IHotword[] = [];

	constructor () { }

	get triggerWord (): string {
		return this._triggerWord;
	}

	setTriggerWord (word: string) {
		this._triggerWord = word.toLowerCase();
	}

	on (cmd: string, callback: Function): void;
	on (cmd: string, ignoreTriggerWord: boolean, callback: Function): void;

	on (cmd: string, ignoreTriggerWordOrCb: boolean | Function, cb?: Function): void {
		let ignoreTriggerWord: boolean;
		let callback: Function;

		if (cb) {
			ignoreTriggerWord = ignoreTriggerWordOrCb as boolean;
			callback = cb;
		} else {
			ignoreTriggerWord = false;
			callback = ignoreTriggerWordOrCb as Function;
		}

		this._registeredHotwords.push({
			cmd: StructuredCmd.parse(cmd),
			ignoreTriggerWord: ignoreTriggerWord,
			callback: callback
		});
	}

	evaluate (cmd: string): Promise<LogStatus> {
		return new Promise(resolve => {
			setTimeout(() => resolve(LogStatus.SUCCESS), 3000);
		});
	}

	logRegisteredHotwords (): void {
		console.log(this._registeredHotwords);
	}
}
