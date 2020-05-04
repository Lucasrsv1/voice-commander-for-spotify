import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ICmdLog, LogStatus } from './ICmdLog';
import { ITrack } from 'src/app/models/ITrack';
import { HotwordsService } from './hotwords/hotwords.service';
import { PlaybackService } from '../playback/playback.service';

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

	constructor (
		private hotwordsService: HotwordsService,
		private playbackService: PlaybackService
	) {
		this.commandsHistory = [];
		if (typeof SpeechRecognition === "undefined")
			this.speech = new webkitSpeechRecognition();
		else
			this.speech = new SpeechRecognition();

		this.speech.interimResults = false;
		this.speech.continuous = true;
		this.speech.onresult = this.speechResult.bind(this);
		this.speech.onend = this.speechEnd.bind(this);
		this.speech.onerror = this.speechError.bind(this);

		// TODO: use user's preferences to decide what language to use
		this.setLanguage("en-US");

		// Register hotwords
		this.hotwordsService.setTriggerWord("Spotify");
		this.hotwordsService.on([{
			cmd: "{play||{{add|ad|list} [up] [to [the] queue]}} [[the] song] {WORDS} from [the] {album|disc} {WORDS}",
			ignoreTriggerWord: true,
			callback: this.playSongFromAlbum.bind(this)
		}, {
			cmd: "{play||{{add|ad|list} [up] [to [the] queue]}} [[the] song] {WORDS} [{by||from} [[the] {artist|singer}] {WORDS}]",
			ignoreTriggerWord: true,
			callback: this.playSong.bind(this)
		}]);

		this.hotwordsService.on("{play|resume} [[the] song]", this.resume.bind(this));
		this.hotwordsService.on("{stop|pause} [[the] song]", this.pause.bind(this));

		this.hotwordsService.on("[bring [the]] volume {up||down}", this.volume.bind(this));
		this.hotwordsService.on("{increase||decrease} [the] volume", this.volume.bind(this));

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

	speechError (event: ErrorEvent): void {
		console.error(event);
		this.speech.stop();
		if (event.error === "network") {
			// TODO: handle this error
		}
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

		let status = await this.hotwordsService.evaluate<Promise<LogStatus>>(cmd);
		log.status = status ? status : LogStatus.NOT_RECOGNIZED;
		this.updateLogs();
	}

	async playSong (playOrAdd: string, song: string, separator?: string, artist?: string): Promise<LogStatus> {
		try {
			let result: ITrack[];
			if (playOrAdd === "play")
				result = await this.playbackService.playSong({ song, artist, separator }).toPromise();
			else
				result = await this.playbackService.addSongToQueue({ song, artist, separator }).toPromise();

			if (result.length > 1)
				return LogStatus.AMBIGUOUS;
			else
				return LogStatus.SUCCESS;
		} catch (error) {
			console.log(error);
			return LogStatus.ERROR;
		}
	}

	async playSongFromAlbum (playOrAdd: string, song: string, album?: string): Promise<LogStatus> {
		try {
			let result: ITrack[];
			if (playOrAdd === "play")
				result = await this.playbackService.playSong({ song, album }).toPromise();
			else
				result = await this.playbackService.addSongToQueue({ song, album }).toPromise();

			if (result.length > 1)
				return LogStatus.AMBIGUOUS;
			else
				return LogStatus.SUCCESS;
		} catch (error) {
			console.log(error);
			return LogStatus.ERROR;
		}
	}

	async volume (upOrDown: string): Promise<LogStatus> {
		if (upOrDown === "up" || upOrDown === "increase")
			console.log("Increase volume");
		else
			console.log("Decrease volume");

		return LogStatus.SUCCESS;
	}

	async resume (): Promise<LogStatus> {
		console.log("Resume song");
		return LogStatus.SUCCESS;
	}

	async pause (): Promise<LogStatus> {
		console.log("Pause song");
		return LogStatus.SUCCESS;
	}
}
