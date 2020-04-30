export enum LogStatus { RUNNING, SUCCESS, ERROR, AMBIGUOUS, NOT_RECOGNIZED }

export interface ICmdLog {
	text: string;
	status: LogStatus;
}
