import { Component, OnInit } from '@angular/core';

import { VoiceCommanderService } from 'src/app/services/voice-commander/voice-commander.service';

@Component({
	selector: 'app-commander-console',
	templateUrl: './commander-console.component.html',
	styleUrls: ['./commander-console.component.scss']
})
export class CommanderConsoleComponent implements OnInit {
	constructor (private voiceCommanderService: VoiceCommanderService) { }

	ngOnInit (): void { }
}
