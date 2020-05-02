export enum LogStatus { NOT_RECOGNIZED, RUNNING, SUCCESS, ERROR, AMBIGUOUS }

export interface ICmdLog {
	text: string;
	status: LogStatus;
}
