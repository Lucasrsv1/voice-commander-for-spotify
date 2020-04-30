import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';

import { VoiceCommanderService } from 'src/app/services/voice-commander/voice-commander.service';
import { ICmdLog, LogStatus } from 'src/app/services/voice-commander/ICmdLog';

@Component({
	selector: 'app-latest-commands',
	templateUrl: './latest-commands.component.html',
	styleUrls: ['./latest-commands.component.scss']
})
export class LatestCommandsComponent implements OnInit {
	public logs: ICmdLog[];
	private logs$: Observable<ICmdLog[]>;

	constructor (
		private changeDetectorRef: ChangeDetectorRef,
		private voiceCommanderService: VoiceCommanderService
	) { }

	ngOnInit (): void {
		this.logs$ = this.voiceCommanderService.latestCommands;
		this.logs$.subscribe(logs => {
			this.logs = logs;
			this.changeDetectorRef.detectChanges();
		});
	}

	className (log: ICmdLog): any {
		return {
			"list-group-item-primary": log.status === LogStatus.RUNNING,
			"list-group-item-success": log.status === LogStatus.SUCCESS,
			"list-group-item-danger": log.status === LogStatus.ERROR,
			"list-group-item-warning": log.status === LogStatus.AMBIGUOUS,
			"list-group-item-light": log.status === LogStatus.NOT_RECOGNIZED
		};
	}

	runCmd (cmd: string): void {
		this.voiceCommanderService.evaluate(cmd);
	}
}
