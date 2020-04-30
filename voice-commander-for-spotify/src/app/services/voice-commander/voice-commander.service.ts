import { Injectable } from '@angular/core';

import { ICmdLog, LogStatus } from './ICmdLog';
import { BehaviorSubject, Observable } from 'rxjs';
import { HotwordsService } from './hotwords.service';

interface webkitSpeechRecognition extends SpeechRecognition {}

declare var webkitSpeechRecognition: {
    prototype: webkitSpeechRecognition;
    new(): webkitSpeechRecognition;
};

@Injectable({ providedIn: 'root' })
export class VoiceCommanderService {
	public keepListening: boolean = true;

	private readonly LOG_SIZE: number = 50;

	private speech: SpeechRecognition;
	private commandsHistory: Array<ICmdLog>;
	private logsSubject = new BehaviorSubject<ICmdLog[]>([]);

	constructor (private hotwordsService: HotwordsService) {
		this.commandsHistory = [];
		if (typeof SpeechRecognition === "undefined")
			this.speech = new webkitSpeechRecognition();
		else
			this.speech = new SpeechRecognition();

		this.speech.interimResults = false;
		this.speech.continuous = true;
		this.speech.onresult = this.speechResult.bind(this);
		this.speech.onend = this.speechEnd.bind(this);

		// TODO: use user's preferences to decide what language to use
		this.setLanguage("en-US");
	}

	speechResult (event: SpeechRecognitionEvent): void {
		let result = event.results[event.results.length - 1];
		if (result.isFinal)
			this.evaluate(result[0].transcript);
	}

	speechEnd (event: SpeechRecognitionEvent): void {
		if (this.keepListening)
			this.speech.start();
	}

	setLanguage (languageCode: string) {
		this.speech.stop();
		this.speech.lang = languageCode;
		this.speech.start();
	}

	get latestCommands (): Observable<ICmdLog[]> {
		return this.logsSubject.asObservable();
	}

	updateLogs (): void {
		this.logsSubject.next(this.commandsHistory.slice(-this.LOG_SIZE).reverse());
	}

	async evaluate (cmd: string): Promise<void> {
		cmd = cmd.trim();

		let log = { text: cmd, status: LogStatus.RUNNING };
		this.commandsHistory.push(log);
		this.updateLogs();

		let status = await this.hotwordsService.evaluate(cmd);
		log.status = status;
		this.updateLogs();
	}
}
