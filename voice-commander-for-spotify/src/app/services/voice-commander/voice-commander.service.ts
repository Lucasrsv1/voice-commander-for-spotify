import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ICmdLog, LogStatus } from './ICmdLog';
import { HotwordsService } from './hotwords/hotwords.service';
import { PlaybackService, IPlayResponse } from '../playback/playback.service';

interface webkitSpeechRecognition extends SpeechRecognition {}

declare var webkitSpeechRecognition: {
    prototype: webkitSpeechRecognition;
    new(): webkitSpeechRecognition;
};

@Injectable({ providedIn: 'root' })
export class VoiceCommanderService {
	private readonly LOG_SIZE: number = 50;

	private keepListening: boolean;
	private speech: SpeechRecognition;
	private commandsHistory: Array<ICmdLog>;
	private logsSubject = new BehaviorSubject<ICmdLog[]>([]);
	private cmdExecutionCallback: (error: Error, result: any) => void;

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

		this.cmdExecutionCallback = () => {};

		// Register hotwords
		this.hotwordsService.setTriggerWord("Spotify");
		this.hotwordsService.on([{
			cmd: "{play||{{add|list} [up] [to [the] queue]}} [[the] song] {WORDS} from [the] {album|disc} {WORDS}",
			ignoreTriggerWord: true,
			callback: this.playSongFromAlbum.bind(this)
		}, {
			cmd: "{play||{{add|list} [up] [to [the] queue]}} [[the] song] {WORDS} [{by||from} [[the] {artist|singer}] {WORDS}]",
			ignoreTriggerWord: true,
			callback: this.playSong.bind(this)
		}, {
			cmd: "{play|resume} [[the] song]",
			callback: this.resume.bind(this)
		}]);

		this.hotwordsService.on("{stop|pause} [[the] song]", this.pause.bind(this));
		this.hotwordsService.on("[bring [the]] volume {up||down}", this.volume.bind(this));
		this.hotwordsService.on("{increase||decrease} [the] volume", this.volume.bind(this));

		this.hotwordsService.logRegisteredHotwords();
	}

	public get triggerWord (): string {
		return this.hotwordsService.triggerWord;
	}

	public setCmdExecutionCallback (callback: (error: Error, result: any) => void): void {
		this.cmdExecutionCallback = callback;
	}

	public listenLanguage (languageCode: string) {
		this.speech.stop();
		this.speech.lang = languageCode;
		this.keepListening = true;
		this.speech.start();
	}

	public stopListening (): void {
		this.keepListening = false;
		this.speech.stop();
	}

	public get latestCommands (): Observable<ICmdLog[]> {
		return this.logsSubject.asObservable();
	}

	public async evaluate<T> (cmd: string): Promise<T> {
		cmd = cmd.trim();

		let log = { text: cmd, status: LogStatus.RUNNING };
		this.commandsHistory.push(log);
		this.updateLogs();

		let evaluation = await this.hotwordsService.evaluate<
			Promise<{ status: LogStatus, result: T, error: any }>
		>(cmd, true);

		log.status = evaluation ? evaluation.status || LogStatus.ERROR : LogStatus.NOT_RECOGNIZED;
		this.updateLogs();

		if (evaluation)
			this.cmdExecutionCallback(evaluation.error, evaluation.result);

		if (evaluation && evaluation.error)
			throw evaluation.error;

		return evaluation ? evaluation.result : null;
	}

	private speechResult (event: SpeechRecognitionEvent): void {
		let result = event.results[event.results.length - 1];
		if (result.isFinal) {
			try {
				this.evaluate<any>(result[0].transcript);
			} catch (error) {
				console.error(error);
			}
		}
	}

	private speechEnd (event: SpeechRecognitionEvent): void {
		if (this.keepListening)
			this.speech.start();
	}

	private speechError (event: ErrorEvent): void {
		console.error(event);
		this.speech.stop();
		if (event.error === "network") {
			// TODO: handle this error
		}
	}

	private updateLogs (): void {
		this.logsSubject.next(this.commandsHistory.slice(-this.LOG_SIZE).reverse());
	}

	private async playSong (playOrAdd: string, song: string, separator?: string, artist?: string): Promise<{ status: LogStatus, result: IPlayResponse, error: any }> {
		try {
			let result: IPlayResponse & { isPlay?: boolean };

			if (playOrAdd === "play")
				result = await this.playbackService.playSong({ song, artist, separator }).toPromise();
			else
				result = await this.playbackService.addSongToQueue({ song, artist, separator }).toPromise();

			result.isPlay = playOrAdd === "play";
			if (result.tracks.length > 1)
				return { result, status: LogStatus.AMBIGUOUS, error: null };
			else
				return { result, status: LogStatus.SUCCESS, error: null };
		} catch (error) {
			return { result: null, status: LogStatus.ERROR, error };
		}
	}

	private async playSongFromAlbum (playOrAdd: string, song: string, album?: string): Promise<{ status: LogStatus, result: IPlayResponse, error: any }> {
		try {
			let result: IPlayResponse & { isPlay?: boolean };

			if (playOrAdd === "play")
				result = await this.playbackService.playSong({ song, album }).toPromise();
			else
				result = await this.playbackService.addSongToQueue({ song, album }).toPromise();

			result.isPlay = playOrAdd === "play";
			if (result.tracks.length > 1)
				return { result, status: LogStatus.AMBIGUOUS, error: null };
			else
				return { result, status: LogStatus.SUCCESS, error: null };
		} catch (error) {
			return { result: null, status: LogStatus.ERROR, error };
		}
	}

	private async volume (upOrDown: string): Promise<{ status: LogStatus, result: null, error: any }> {
		if (upOrDown === "up" || upOrDown === "increase")
			console.log("Increase volume");
		else
			console.log("Decrease volume");

		return { status: LogStatus.ERROR, result: null, error: null };
	}

	private async resume (): Promise<{ status: LogStatus, result: null, error: any }> {
		console.log("Resume song");
		return { status: LogStatus.SUCCESS, result: null, error: null };
	}

	private async pause (): Promise<{ status: LogStatus, result: null, error: any }> {
		console.log("Pause song");
		return { status: LogStatus.SUCCESS, result: null, error: null };
	}
}
