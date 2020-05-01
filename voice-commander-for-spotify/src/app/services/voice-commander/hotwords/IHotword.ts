import { StructuredCmd } from './StructuredCmd';

export interface IHotword {
	cmd: StructuredCmd;
	ignoreTriggerWord: boolean;
	callback: Function;
}
