import { Injectable } from '@angular/core';

import { ICmdLog, LogStatus } from './ICmdLog';
import { BehaviorSubject, Observable } from 'rxjs';
import { HotwordsService } from './hotwords/hotwords.service';

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

		// Register hotwords
		this.hotwordsService.setTriggerWord("Spotify");
		this.hotwordsService.on("play [[the] song] {WORDS} [{by|from} {!album} {!disc} {WORDS}]", true, this.playSong.bind(this));
		this.hotwordsService.on("play [[the] song] {WORDS} from [the] {album|disc} {WORDS}", true, this.playSongFromAlbum.bind(this));

		this.hotwordsService.logRegisteredHotwords();
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

	playSong (songName: string, separator?: string, artist?: string): void {
		console.log("Song:", songName);
		console.log("Separator:", separator);
		console.log("Artist?:", artist);
	}

	playSongFromAlbum (songName: string, album?: string): void {
		console.log("Song:", songName);
		console.log("Album?:", album);
	}
}
