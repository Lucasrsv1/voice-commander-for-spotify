export enum CmdType { POINTER, CONSTANT, OR, DENIAL, STRING, NUMBER }

export class StructuredCmd {
	public isRequired: boolean;
	public type: CmdType;

	private _commandStr: string;
	private _nextCmd: StructuredCmd;
	private _deepCmd: StructuredCmd;

	constructor (cmd: string, isRequired: boolean = true, type: CmdType = null) {
		this.type = type;
		this.isRequired = isRequired;

		this._commandStr = cmd;
		this._nextCmd = null;
		this._deepCmd = null;
	}

	public get commandStr (): string {
		return this._commandStr;
	}

	public get nextCmd (): StructuredCmd {
		return this._nextCmd;
	}

	public set nextCmd (val: StructuredCmd) {
		this._nextCmd = val;
	}

	public get deepCmd (): StructuredCmd {
		return this._deepCmd;
	}

	public set deepCmd (val: StructuredCmd) {
		this._deepCmd = val;
	}

	public static parse (cmd: string): StructuredCmd {
		let command = new StructuredCmd(cmd);
		command.type = CmdType.POINTER;

		if (cmd.indexOf("[") > -1) {
			let pieces = this.splitBrackets(cmd, false, command);
			if (pieces.bracketsCmd)
				pieces.bracketsCmd.isRequired = false;
		} else if (cmd.indexOf("{") > -1) {
			this.splitBrackets(cmd, true, command);
		} else if (cmd.indexOf("|") > -1) {
			command.type = CmdType.OR;
			cmd.split('|').reduce((parent, c) => {
				let node = StructuredCmd.parse(c);
				parent.deepCmd = node;
				return node;
			}, command);
		} else if (cmd[0] === '!') {
			// TODO: add support to something like "... !{album|disc} ..."
			command.type = CmdType.DENIAL;
			command.deepCmd = StructuredCmd.parse(cmd.substr(1));
		} else if (cmd === "WORDS") {
			command.type = CmdType.STRING;
		} else if (cmd.indexOf("NUMBER") === 0) {
			command.type = CmdType.NUMBER;
		} else {
			command.type = CmdType.CONSTANT;
		}

		return command;
	}

	private static splitBrackets (cmd: string, isCurly: boolean, command: StructuredCmd) {
		let openChar = isCurly ? '{' : '[';
		let closeChar = isCurly ? '}' : ']';

		let result: {
			leftPart: StructuredCmd,
			bracketsCmd: StructuredCmd,
			rightPart: StructuredCmd
		};

		result = {
			leftPart: null,
			bracketsCmd: null,
			rightPart: null
		};

		let leftPart = cmd.substring(0, cmd.indexOf(openChar)).trim();
		if (leftPart.length > 0)
			result.leftPart = StructuredCmd.parse(leftPart);

		cmd = cmd.substr(cmd.indexOf(openChar) + 1).trim();

		let skip = 0;
		let openBrackets = 0;
		let closeBrackets = 0;

		do {
			openBrackets = cmd.substr(skip).indexOf(openChar);
			closeBrackets = cmd.substr(skip).indexOf(closeChar);
			if (openBrackets > -1 && closeBrackets > openBrackets)
				skip = closeBrackets + 1;
			else
				break;
		} while (cmd.substr(skip).length > 0);

		let bracketsPart = cmd.substring(0, skip + closeBrackets).trim();
		if (bracketsPart.length > 0)
			result.bracketsCmd = StructuredCmd.parse(bracketsPart);

		cmd = cmd.substr(skip + closeBrackets + 1).trim();
		if (cmd.length > 0)
			result.rightPart = StructuredCmd.parse(cmd);

		// Linking parts
		if (result.leftPart)
			result.leftPart.nextCmd = result.bracketsCmd ? result.bracketsCmd : result.rightPart;

		if (result.bracketsCmd)
			result.bracketsCmd.nextCmd = result.rightPart;

		// Linking the parent command
		if (result.leftPart)
			command.deepCmd = result.leftPart;
		else if (result.bracketsCmd)
			command.deepCmd = result.bracketsCmd;
		else
			command.deepCmd = result.rightPart;

		return result;
	}
}
