import { Injectable } from '@angular/core';

import { IHotword } from './IHotword';
import { StructuredCmd, IEvaluation, CmdType } from './StructuredCmd';

@Injectable({ providedIn: 'root' })
export class HotwordsService {
	private _triggerWord: string;
	private _registeredHotwords: Array<IHotword | IHotword[]> = [];

	constructor () { }

	public get triggerWord (): string {
		return this._triggerWord;
	}

	public setTriggerWord (word: string) {
		this._triggerWord = word.toLowerCase();
	}

	public on (cmd: string, callback: Function): void;
	public on (cmd: string, ignoreTriggerWord: boolean, callback: Function): void;
	public on (cmds: Array<{ cmd: string, callback: Function, ignoreTriggerWord?: boolean }>): void;

	public on (cmd: string | Array<{ cmd: string, callback: Function, ignoreTriggerWord?: boolean }>, ignoreTriggerWordOrCb?: boolean | Function, cb?: Function): void {
		if (typeof cmd === "string") {
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
		} else {
			this._registeredHotwords.push(
				cmd.map(hot => ({
					cmd: StructuredCmd.parse(hot.cmd),
					ignoreTriggerWord: hot.ignoreTriggerWord,
					callback: hot.callback
				}))
			);
		}
	}

	public logRegisteredHotwords (): void {
		console.log(this._registeredHotwords);
	}

	public evaluate<T> (input: string): T[];
	public evaluate<T> (input: string, getFirstMatch: boolean): T;

	public evaluate<T> (input: string, getFirstMatch: boolean = false): T | T[] {
		let evaluation: T;
		let results: T[] = [];

		for (let hotword of this._registeredHotwords) {
			if (Array.isArray(hotword))
				evaluation = this.evaluateHotwords<T>(input, hotword);
			else
				evaluation = this.evaluateHotwords<T>(input, [hotword]);

			if (evaluation !== undefined)
				results.push(evaluation);
		}

		return getFirstMatch ? results[0] : results;
	}

	private evaluateHotwords<T> (input: string, hotwords: IHotword[]): T {
		for (let hotword of hotwords) {
			let cmd = input.toLowerCase().trim();
			if (!hotword.ignoreTriggerWord) {
				let triggerWordIndex = cmd.indexOf(this.triggerWord);
				if (triggerWordIndex === -1)
					continue;

				cmd = cmd.substring(triggerWordIndex + this.triggerWord.length).trim();
			}

			let evaluation: IEvaluation = hotword.cmd.evaluate(cmd);
			if (evaluation.match) {
				let params: any[] = evaluation.arguments.map(a => {
					switch (a.type) {
						case CmdType.SWITCH:
							return evaluation.switchParams[a.paramIndex];
						case CmdType.STRING:
							return evaluation.stringParams[a.paramIndex].value;
						case CmdType.NUMBER:
							return evaluation.numberParams[a.paramIndex].value;
						default:
							return null;
					}
				});

				return hotword.callback(...params) as T;
			}
		}

		return undefined as T;
	}
}
