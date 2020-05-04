export enum CmdType { POINTER, CONSTANT, OR, SWITCH, DENIAL, STRING, NUMBER }

export interface IEvaluation {
	match: boolean;
	remaining: string;
	switchParams: string[];
	stringParams: Array<{ value: string, completed: boolean }>;
	numberParams: Array<{ value: number, originalStr: string }>;
	arguments: Array<{ type: CmdType, paramIndex: number }>;
}

export class StructuredCmd {
	public isRequired: boolean;
	public type: CmdType;

	private _commandStr: string;
	private _nextCmd: StructuredCmd;
	private _deepCmd: StructuredCmd;

	constructor (cmd: string, isRequired: boolean = true, type: CmdType = null) {
		this.type = type;
		this.isRequired = isRequired;

		this._commandStr = cmd.toLowerCase();
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

	public evaluate (input: string, matchFromBegining: boolean = false, lastCmdStringParams: Array<{ value: string, completed: boolean }> = []): IEvaluation {
		let result: IEvaluation = {
			match: false,
			remaining: input,
			stringParams: [],
			switchParams: [],
			numberParams: [],
			arguments: []
		};

		switch (this.type) {
			case CmdType.POINTER:
				result = this.deepCmd.evaluate(input, matchFromBegining, lastCmdStringParams);
				break;
			case CmdType.CONSTANT:
				let index = input.indexOf(this.commandStr);
				if (index > -1) {
					result.match = !matchFromBegining || index === 0;
					result.remaining = input.substr(index + this.commandStr.length).trim();
				}
				break;
			case CmdType.OR:
			case CmdType.SWITCH:
				let deepResult: IEvaluation;
				let selectedCmd = "";

				let deep = this.deepCmd;
				do {
					deepResult = deep.evaluate(input, matchFromBegining);
					if (deepResult.match) {
						if (!result.match || result.remaining.length < deepResult.remaining.length) {
							selectedCmd = deep.commandStr;
							result.remaining = deepResult.remaining;
							result.match = true;
						}
					}

					deep = deep.deepCmd;
				} while (deep);

				if (this.type === CmdType.SWITCH && result.match) {
					let paramIdx = result.switchParams.length;
					result.switchParams.push(selectedCmd);
					result.arguments.push({ type: CmdType.SWITCH, paramIndex: paramIdx });
				}
				break;
			case CmdType.DENIAL:
				let denialResult = this.deepCmd.evaluate(input, true);
				result.match = !denialResult.match;
				break;
			case CmdType.STRING:
				if (input.length > 0) {
					result.match = true;

					let paramIdx = result.stringParams.length;
					result.stringParams.push({ value: input, completed: false });
					result.arguments.push({ type: CmdType.STRING, paramIndex: paramIdx });
				}
				break;
			case CmdType.NUMBER:
				// TODO: implement support to NUMBER

				// Numbers can show in the transcript in the following ways:
				// once
				// one time
				// twice
				// 3 *
				// 5 times
				// 1006 times
				break;
			default:
				console.warn(`Structured command of type ${this.type} is not valid.`);
		}

		if (!result.match) {
			// If the command didn't match, reset the result
			result = {
				match: !this.isRequired,
				remaining: input,
				stringParams: [],
				switchParams: [],
				numberParams: [],
				arguments: []
			};
		} else {
			let notCompletedStringParam = lastCmdStringParams.find(s => !s.completed);
			if (notCompletedStringParam) {
				let idx = notCompletedStringParam.value.indexOf(this.commandStr);
				if (idx > -1) {
					notCompletedStringParam.value = notCompletedStringParam.value.substring(0, idx).trim();
					notCompletedStringParam.completed = true;
				}
			}
		}

		if (result.match && this.nextCmd) {
			let nextResult = this.nextCmd.evaluate(result.remaining, result.stringParams.length === 0, result.stringParams);

			result.match = nextResult.match;
			if (nextResult.match) {
				result.remaining = nextResult.remaining;

				let notCompletedStringParam = result.stringParams.find(s => !s.completed);
				if (notCompletedStringParam) {
					let params = nextResult.stringParams.map(s => s.value);
					params = params.concat(nextResult.switchParams);
					params = params.concat(nextResult.numberParams.map(n => n.originalStr));

					let smallestIndex = null;
					for (let param of params) {
						if (!param || param.length === 0)
							continue;

						let idx = notCompletedStringParam.value.indexOf(param);
						if (idx > -1 && (smallestIndex === null || idx < smallestIndex))
							smallestIndex = idx;
					}

					if (smallestIndex || smallestIndex === 0)
						notCompletedStringParam.value = notCompletedStringParam.value.substring(0, smallestIndex).trim();

					notCompletedStringParam.completed = true;
				}

				for (let argument of nextResult.arguments) {
					let paramIdx: number;
					switch (argument.type) {
						case CmdType.SWITCH:
							paramIdx = result.switchParams.length;
							result.switchParams.push(nextResult.switchParams[argument.paramIndex]);
							result.arguments.push({ type: CmdType.SWITCH, paramIndex: paramIdx });
							break;
						case CmdType.STRING:
							paramIdx = result.stringParams.length;
							result.stringParams.push(nextResult.stringParams[argument.paramIndex]);
							result.arguments.push({ type: CmdType.STRING, paramIndex: paramIdx });
							break;
						case CmdType.NUMBER:
							paramIdx = result.numberParams.length;
							result.numberParams.push(nextResult.numberParams[argument.paramIndex]);
							result.arguments.push({ type: CmdType.NUMBER, paramIndex: paramIdx });
							break;
					}
				}
			}
		}

		return result;
	}

	public static parse (cmd: string): StructuredCmd {
		let command = new StructuredCmd(cmd);
		command.type = CmdType.POINTER;

		let bracketsIndex = cmd.indexOf("[");
		let curlyBracketsIndex = cmd.indexOf("{");
		let pipeIndex = cmd.indexOf("|");

		if (
			bracketsIndex > -1 && (
				(bracketsIndex < curlyBracketsIndex || curlyBracketsIndex === -1) &&
				(bracketsIndex < pipeIndex || pipeIndex === -1)
			)
		) {
			let pieces = this.splitBrackets(cmd, false, command);
			if (pieces.bracketsCmd)
				pieces.bracketsCmd.isRequired = false;
		} else if (
			curlyBracketsIndex > -1 && (
				(curlyBracketsIndex < bracketsIndex || bracketsIndex === -1) &&
				(curlyBracketsIndex < pipeIndex || pipeIndex === -1)
			)
		) {
			this.splitBrackets(cmd, true, command);
		} else if (pipeIndex > -1) {
			if (pipeIndex === cmd.indexOf("||")) {
				command.type = CmdType.SWITCH;
				cmd = cmd.replace("||", '|');
			} else {
				command.type = CmdType.OR;
			}

			let parts = [
				cmd.substring(0, pipeIndex),
				cmd.substring(pipeIndex + 1)
			];

			parts.reduce((parent, c) => {
				let node = StructuredCmd.parse(c);
				parent.deepCmd = node;
				return node;
			}, command);
		} else if (cmd[0] === '!') {
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
		let isDenial = false;

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
		if (leftPart == '!')
			isDenial = true;
		else if (leftPart.length > 0)
			result.leftPart = StructuredCmd.parse(leftPart);

		cmd = cmd.substr(cmd.indexOf(openChar) + 1).trim();

		let skipOpen = 0;
		let skipClose = 0;
		let openBrackets = 0;
		let closeBrackets = 0;

		do {
			openBrackets = cmd.substr(skipOpen).indexOf(openChar);
			closeBrackets = cmd.substr(skipClose).indexOf(closeChar);
			if (openBrackets > -1 && skipClose + closeBrackets > skipOpen + openBrackets) {
				skipOpen += openBrackets + 1;
				skipClose += closeBrackets + 1;
			} else {
				break;
			}
		} while (cmd.substr(skipClose).length > 0);

		let bracketsPart = cmd.substring(0, skipClose + closeBrackets).trim();
		if (bracketsPart.length > 0) {
			let bracketsCmd = StructuredCmd.parse(bracketsPart);
			if (isDenial) {
				let denial = new StructuredCmd(`!${openChar}${bracketsPart}${closeChar}`, isCurly, CmdType.DENIAL)
				denial.deepCmd = bracketsCmd;
				result.bracketsCmd = denial;
			} else {
				result.bracketsCmd = bracketsCmd;
			}
		}

		cmd = cmd.substr(skipClose + closeBrackets + 1).trim();
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
