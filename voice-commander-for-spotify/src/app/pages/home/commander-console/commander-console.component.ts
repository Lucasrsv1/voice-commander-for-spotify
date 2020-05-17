import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { ITrack } from 'src/app/models/ITrack';
import { IPlayResponse, PlaybackService } from 'src/app/services/playback/playback.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { VoiceCommanderService } from 'src/app/services/voice-commander/voice-commander.service';

@Component({
	selector: 'app-commander-console',
	templateUrl: './commander-console.component.html',
	styleUrls: ['./commander-console.component.scss', '../list-group.scss']
})
export class CommanderConsoleComponent implements OnInit {
	public command: string;
	public recording: boolean;

	public tracks: ITrack[];
	public isPlay: boolean;
	public selectedTrack: number;

	constructor (
		private changeDetectorRef: ChangeDetectorRef,
		private playbackService: PlaybackService,
		private utils: UtilsService,
		private voiceCommanderService: VoiceCommanderService
	) { }

	ngOnInit (): void {
		this.toggleRecording(false);
		this.voiceCommanderService.setCmdExecutionCallback(this.cmdExecutionCallback.bind(this));
	}

	getImg (track: ITrack): string {
		return this.utils.getImg(track.album.images);
	}

	toggleRecording (): void;
	toggleRecording (forcedValue: boolean): void;

	toggleRecording (forcedValue: boolean = null): void {
		if (forcedValue !== null)
			this.recording = forcedValue;
		else
			this.recording = !this.recording;

		// TODO: use user's preferences to decide what language to use
		if (this.recording)
			this.voiceCommanderService.listenLanguage("en-US");
		else
			this.voiceCommanderService.stopListening();
	}

	async sendCmd (): Promise<void> {
		if (!this.command || !this.command.trim().length)
			return;

		await this.voiceCommanderService.evaluate<any>(this.voiceCommanderService.triggerWord + " " + this.command);
		this.command = "";
	}

	cmdExecutionCallback (error: Error, result: any): void {
		if (error)
			return this.utils.handlerError("Error running command.", error);

		if (result && result.tracks) {
			this.tracks = result.tracks as ITrack[];
			this.selectedTrack = 0;
			this.isPlay = result.isPlay;
		} else {
			this.tracks = [];
			this.selectedTrack = -1;
			this.isPlay = null;
		}

		this.changeDetectorRef.detectChanges();
	}

	async playTrack (index: number): Promise<void> {
		if (this.tracks && this.tracks[index]) {
			try {
				let result: IPlayResponse;
				if (this.isPlay)
					result = await this.playbackService.playTrack(this.tracks[index]).toPromise();
				else
					result = await this.playbackService.addTrackToQueue(this.tracks[index]).toPromise();

				this.selectedTrack = index;
				this.changeDetectorRef.detectChanges();
			} catch (error) {
				this.utils.handlerError("Error running command.", error);
			}
		}
	}
}
