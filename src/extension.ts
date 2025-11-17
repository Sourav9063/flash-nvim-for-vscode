import * as vscode from 'vscode';
const flashVscodeModes = { idle: 'idle', active: 'active', lineUp: 'lineUp', lineDown: 'lineDown', symbol: 'symbol', selection: 'selection', enter: 'enter', shiftEnter: 'shiftEnter', };
const flashVscodeModeKey = 'flash-vscode-mode';
let flashVscodeMode: string = flashVscodeModes.idle;

const updateFlashVscodeMode = (mode: string) => {
	flashVscodeMode = mode;
	vscode.commands.executeCommand('setContext', flashVscodeModeKey, flashVscodeMode);
};

const isMode = (...modes: string[]) => {
	return modes.includes(flashVscodeMode);
};


export function activate(context: vscode.ExtensionContext) {
	// Decoration types for grey-out, highlight, and labels:
	updateFlashVscodeMode(flashVscodeModes.idle);
	let config: vscode.WorkspaceConfiguration;
	let dimDecoration: vscode.TextEditorDecorationType;
	let matchDecoration: vscode.TextEditorDecorationType;
	let labelDecoration: vscode.TextEditorDecorationType;
	let labelDecorationQuestion: vscode.TextEditorDecorationType;

	let dimOpacity: string;
	let matchColor: string;
	let matchFontWeight: string;
	let labelColor: string;
	let labelBackgroundColor: string;
	let labelQuestionBackgroundColor: string;
	let labelFontWeight: string;
	let labelChars: string;
	let caseSensitive: boolean;

	const getConfiguration = () => {
		config = vscode.workspace.getConfiguration('flash-vscode');
		dimOpacity = config.get<string>('dimOpacity', '0.65');
		matchColor = config.get<string>('matchColor', '#3e68d7');
		matchFontWeight = config.get<string>('matchFontWeight', 'bold');
		labelColor = config.get<string>('labelColor', '#ffffff');
		labelBackgroundColor = config.get<string>('labelBackgroundColor', '#ff007c');
		labelQuestionBackgroundColor = config.get<string>('labelQuestionBackgroundColor', '#3E68D7');
		labelFontWeight = config.get<string>('labelFontWeight', 'bold');
		// Define the character pool for labels: lowercase, then uppercase, then digits
		labelChars = config.get<string>('labelKeys', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:\'",.<>/`~\\');
		caseSensitive = config.get<boolean>('caseSensitive', false);

		dimDecoration = vscode.window.createTextEditorDecorationType({
			opacity: dimOpacity
		});
		matchDecoration = vscode.window.createTextEditorDecorationType({
			opacity: '1 !important',
			color: '#00000000', // Make the actual text transparent
			before: {
				color: matchColor,
				fontWeight: matchFontWeight,
				backgroundColor: `${matchColor}aa`,
				textDecoration: `none; z-index: 10; position: absolute;`,
			}
		});
		labelDecoration = vscode.window.createTextEditorDecorationType({
			opacity: '1 !important',
			color: '#00000000',
			before: {
				color: labelColor,
				backgroundColor: labelBackgroundColor,
				fontWeight: labelFontWeight,
				textDecoration: `none; z-index: 100; position: absolute;`,
			}
		});
		labelDecorationQuestion = vscode.window.createTextEditorDecorationType({
			opacity: '1 !important',
			color: '#00000000',
			before: {
				color: labelColor,
				backgroundColor: labelQuestionBackgroundColor,
				contentText: '?',
				fontWeight: labelFontWeight,
				textDecoration: `none; z-index: 100; position: absolute;`,
			}
		});

	};
	getConfiguration();

	function throttle(func: Function, delay: number) {
		let timeoutId: NodeJS.Timeout | null = null;
		let lastArgs: any[] | null = null;
		let lastThis: any = null;

		const throttled = function (...args: any[]) {
			lastArgs = args;
			lastThis = this;

			if (!timeoutId) {
				timeoutId = setTimeout(() => {
					func.apply(lastThis, lastArgs);
					timeoutId = null;
					lastArgs = null;
					lastThis = null;
				}, delay);
			}
		};

		// Add a cancel method to clear any pending execution
		throttled.cancel = () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
				lastArgs = null;
				lastThis = null;
			}
		};

		return throttled;
	}

	let active = false;
	let searchQuery = '';
	let prevSearchQuery = '';
	let symbols: vscode.DocumentSymbol[] = [];
	let isSelection = false;

	// Map of label character to target position and optional full range for selection
	let labelMap: Map<string, { editor: vscode.TextEditor, position: vscode.Position, range?: vscode.Range }> = new Map();

	interface LocationInfo { editor: vscode.TextEditor, range: vscode.Range, matchStart: vscode.Position, relativeDis: number }
	let allMatches: LocationInfo[] = [];
	let allMatchSortByRelativeDis: LocationInfo[] | undefined;
	let prevSortKey: string = '';
	let nextMatchIndex: number | undefined;

	const searchChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~`!@#$%^&*()-_=+[]{}|\\;:\'",.<>/?';

	async function getOutlineRangesForVisibleEditors(editor: vscode.TextEditor) {

		const document = editor.document;
		const documentUri = document.uri;

		try {
			symbols = symbols.length === 0 ? symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
				'vscode.executeDocumentSymbolProvider',
				documentUri
			) : symbols;

			if (symbols) {
				itrSymbol(symbols, editor);
			} else {
			}

		} catch (error) {
		}
	}

	function itrSymbol(symbols: vscode.DocumentSymbol[], editor: vscode.TextEditor) {
		for (const symbol of symbols) {
			const range = symbol.range;
			allMatches.push({ editor, range: new vscode.Range(range.start, new vscode.Position(range.start.line, range.start.character + symbol.name.length)), matchStart: range.start, relativeDis: relativeVsCodePosition(range.start) });
			if (symbol.children.length > 0) {
				itrSymbol(symbol.children, editor);
			}
		}
	}

	function relativeVsCodePosition(pos: vscode.Position) {
		return pos.line * 1000 + pos.character;
	}

	// Get treesitter-style selection ranges using LSP selection range provider
	async function getSelectionRanges(editor: vscode.TextEditor, position: vscode.Position) {
		const document = editor.document;
		try {
			const selectionRanges = await vscode.commands.executeCommand<vscode.SelectionRange[]>(
				'vscode.executeSelectionRangeProvider',
				document.uri,
				[ position ]
			);

			if (selectionRanges && selectionRanges.length > 0) {
				// Flatten the hierarchy of selection ranges
				const ranges: vscode.Range[] = [];
				let current: vscode.SelectionRange | undefined = selectionRanges[ 0 ];

				while (current) {
					ranges.push(current.range);
					current = current.parent;
				}

				// Add both start and end positions of each range as separate labels
				// This gives us boundary markers like flash.nvim's treesitter selection
				for (const range of ranges) {
					// Add start position label
					allMatches.push({
						editor,
						range,
						matchStart: range.start,
						relativeDis: relativeVsCodePosition(range.start)
					});

					// Add end position label (only if different from start)
					if (!range.start.isEqual(range.end)) {
						allMatches.push({
							editor,
							range,
							matchStart: range.end,
							relativeDis: relativeVsCodePosition(range.end)
						});
					}
				}
			}
		} catch (error) {
			// Fallback to document symbols if selection range provider is not available
			await getOutlineRangesForVisibleEditors(editor);
		}
	}

	// Example usage: Call this function to get outline ranges for all visible editors

	// Helper to update all editor decorations based on current query
	async function updateHighlights() {
		if (!active) {
			return;
		};

		if (searchQuery.toLowerCase() !== searchQuery) {
			caseSensitive = true;
		} else {
			caseSensitive = config.get<boolean>('caseSensitive', false);
		}
		// show the search query or mode in the status bar
		vscode.window.setStatusBarMessage(searchQuery.length > 0 ? `flash: ${searchQuery}` : `flash: ${flashVscodeMode}`);
		labelMap.clear();
		// for (const editor of vscode.window.visibleTextEditors) {
		// 	if (isSelectionMode && editor !== vscode.window.activeTextEditor) {
		// 		continue;
		// 	}
		// 	editor.setDecorations(dimDecoration, []);
		// }

		// Not empty query: find matches in each visible editor
		allMatches = [];
		let nextChars: string[] = [];

		for (const editor of vscode.window.visibleTextEditors) {
			if (isMode(flashVscodeModes.symbol, flashVscodeModes.selection, flashVscodeModes.lineDown, flashVscodeModes.lineUp) && editor !== vscode.window.activeTextEditor) {
				continue;
			}
			const isActiveEditor = editor === vscode.window.activeTextEditor;
			if (searchQuery.length === 0) {
				editor.setDecorations(dimDecoration, editor.visibleRanges);
				editor.setDecorations(labelDecoration, []);
				editor.setDecorations(labelDecorationQuestion, []);
				if (isMode(flashVscodeModes.active, flashVscodeModes.selection)) {
					continue;
				}
			}
			const document = editor.document;

			if (isMode(flashVscodeModes.symbol)) {
				try {
					// If started in selection mode, use treesitter-style selection ranges
					if (isSelection) {
						const cursorPos = editor.selection.active;
						await getSelectionRanges(editor, cursorPos);
					} else {
						// Otherwise, show all document symbols
						await getOutlineRangesForVisibleEditors(editor);
					}
				} catch (error) {
				}
			}
			else if (isMode(flashVscodeModes.lineDown, flashVscodeModes.lineUp)) {
				const currentLine = editor.selection.active.line;
				const itr = isMode(flashVscodeModes.lineDown) ? 1 : -1;

				for (let i = 0; i < labelChars.length; i++) {
					const line = currentLine + (itr * i);
					if (line > document.lineCount || line < 0) {
						break;
					}
					const matchStart = new vscode.Position(line, 0);
					allMatches.push({ editor, range: new vscode.Range(matchStart, matchStart), matchStart: matchStart, relativeDis: relativeVsCodePosition(matchStart) });
				}

			}
			else {
				// Existing text search logic
				for (const visibleRange of editor.visibleRanges) {
					const startLine = isActiveEditor ? 0 : visibleRange.start.line;
					const endLine = isActiveEditor ? document.lineCount - 1 : visibleRange.end.line;
					for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
						const lineText = document.lineAt(lineNum).text;
						let textToSearch = lineText;
						let queryToSearch = searchQuery;
						//if searchQuery contains any uppercase letter the caseSensitivity is ignored
						if (caseSensitive) {
							textToSearch = lineText;
							queryToSearch = searchQuery;
						}
						else {
							textToSearch = lineText.toLowerCase();
							queryToSearch = searchQuery.toLowerCase();
						}
						// Search for all occurrences of queryToSearch in this line
						let index = textToSearch.indexOf(queryToSearch);
						while (index !== -1) {
							const matchStart = new vscode.Position(lineNum, index);
							const matchEnd = new vscode.Position(lineNum, index + queryToSearch.length);
							// set nextChar to the character after the match, if it exists
							const nextChar = lineText[ index + queryToSearch.length ];
							if (nextChar) {
								nextChars.push(nextChar);
								if (queryToSearch) {
									nextChars.push(nextChar.toLowerCase());
								}
							}
							allMatches.push({ editor, range: new vscode.Range(matchStart, matchEnd), matchStart: matchStart, relativeDis: relativeVsCodePosition(matchStart) });
							index = textToSearch.indexOf(queryToSearch, index + 1);
						}
					}
				}
			}
		}

		const activeEditor = vscode.window.activeTextEditor;
		const distanceOffset = 4;
		if (activeEditor) {
			const cursorPos = activeEditor.selection.active;
			// Helper function to compute Euclidean distance between two positions.
			function getDistance(pos1: vscode.Position, pos2: vscode.Position): number {
				const lineDiff = pos1.line - pos2.line;
				const charDiff = pos1.character - pos2.character;
				return lineDiff * lineDiff * 1000 + charDiff * charDiff + distanceOffset;
			}

			// Sort the matches by distance from the cursor.
			allMatches.sort((a, b) => {
				let weight_a = 1;
				let weight_b = 1;
				if (a.editor !== activeEditor) {
					weight_a = 10000;
				}
				if (b.editor !== activeEditor) {
					weight_b = 10000;
				}

				const distanceA = getDistance(cursorPos, a.matchStart) * weight_a;
				const distanceB = getDistance(cursorPos, b.matchStart) * weight_b;
				return distanceA - distanceB;
			});
			// Remove if the match is the under cursor  
			// if (allMatches.length > 0) {
			// 	const label = allMatches[ 0 ];
			// 	if (getDistance(cursorPos, label.matchStart) === distanceOffset) {
			// 		allMatches.shift();
			// 	}
			// }

		}

		// Decide how many (if any) to label:
		const totalMatches = allMatches.length;
		// deduplicate nextChars
		const allNextChars = [ ...new Set(nextChars) ];
		// all characters that are in labelChars but not in allNextChars
		const useableLabelChars = labelChars.split('').filter(c => !allNextChars.includes(c));

		// create an label array with length equal to the number of matches, and fill it with the useableLabelChars
		// if there are more matches than useableLabelChars, then fill the array with the useableLabelChars and then
		// fill the rest with the question mark character
		const labelCharsToUse = totalMatches > useableLabelChars.length ?
			useableLabelChars.concat(Array(totalMatches - useableLabelChars.length).fill('?')) :
			useableLabelChars.slice(0, totalMatches);

		let charCounter = 0;

		let visibleEditors = vscode.window.visibleTextEditors;
		// move the active editor to the front of the array
		if (activeEditor) {
			visibleEditors = [ activeEditor, ...vscode.window.visibleTextEditors.filter(e => e !== activeEditor) ];
		}

		for (const editor of visibleEditors) {
			const decorationOptions: vscode.DecorationOptions[] = [];
			const questionDecorationOptions: vscode.DecorationOptions[] = [];
			const matchDecorationOption: vscode.DecorationOptions[] = [];
			const labelPositions: vscode.Position[] = [];
			// set the character before the match to the label character
			const isActiveEditor = editor === activeEditor;
			for (const match of allMatches) {
				let flagOutsideVisibleRange = false;
				if (isActiveEditor) {
					for (const visibleRange of editor.visibleRanges) {
						if (match.matchStart.line < visibleRange.start.line || match.matchStart.line > visibleRange.end.line) {
							flagOutsideVisibleRange = true;
							continue;
						}
					}
					if (flagOutsideVisibleRange) {
						continue;
					}
				}

				if (match.editor !== editor) { continue; }
				const labelRange = match.range;
				let char = labelCharsToUse[ charCounter ];
				charCounter++;

				// Add match decoration if there's a search query and match has content
				if (searchQuery.length > 0 && labelRange.end.character > labelRange.start.character + 1) {
					// Replace spaces with non-breaking spaces so they render visibly
					const overlayText = searchQuery.substring(1).replace(/ /g, '\u00A0'); // Everything except first character

					matchDecorationOption.push({
						range: new vscode.Range(
							labelRange.start.line,
							labelRange.start.character + 1,
							labelRange.end.line,
							labelRange.end.character
						),
						renderOptions: {
							before: { contentText: overlayText }
						}
					});
				}

				if (char !== '?') {
					// Store the full range for treesitter-style selection
					labelMap.set(char, { editor: editor, position: match.matchStart, range: match.range });
					labelPositions.push(match.matchStart);
					decorationOptions.push({
						range: new vscode.Range(labelRange.start.line, labelRange.start.character, labelRange.start.line, labelRange.start.character + 1),
						renderOptions: {
							before: { contentText: char }
						}
					});
				}
				else {
					labelPositions.push(match.matchStart);
					questionDecorationOptions.push({
						range: new vscode.Range(labelRange.start.line, labelRange.start.character, labelRange.start.line, labelRange.start.character + 1),
						renderOptions: {
							before: { contentText: '?' }
						}
					});
				}
			}

			// Create dim ranges excluding label positions
			const dimRanges: vscode.Range[] = [];
			for (const visibleRange of editor.visibleRanges) {
				let currentPos = visibleRange.start;

				// Sort label positions for this editor by line and character
				const sortedLabels = labelPositions
					.filter(pos => pos.line >= visibleRange.start.line && pos.line <= visibleRange.end.line)
					.sort((a, b) => a.line === b.line ? a.character - b.character : a.line - b.line);

				for (const labelPos of sortedLabels) {
					// Add dim range from current position to label position
					if (currentPos.isBefore(labelPos)) {
						dimRanges.push(new vscode.Range(currentPos, labelPos));
					}
					// Skip the label character
					currentPos = new vscode.Position(labelPos.line, labelPos.character + 1);
				}

				// Add remaining range after last label
				if (currentPos.isBefore(visibleRange.end)) {
					dimRanges.push(new vscode.Range(currentPos, visibleRange.end));
				}
			}

			editor.setDecorations(dimDecoration, dimRanges);
			editor.setDecorations(labelDecoration, decorationOptions);
			editor.setDecorations(labelDecorationQuestion, questionDecorationOptions);
			editor.setDecorations(matchDecoration, matchDecorationOption);

			if (isMode(flashVscodeModes.selection)) {
				break;
			}
		}
	}

	// Command to start navigation mode
	const _start = () => {
		if (active) { return; };
		active = true;
		// Set a context key for when-clause usage (for keybindings)
		vscode.commands.executeCommand('setContext', 'flash-vscode.active', true);
		// Initial highlight update (just grey out everything visible)
	};

	const start = vscode.commands.registerCommand('flash-vscode.start', () => {
		updateFlashVscodeMode(flashVscodeModes.active);
		_start();
		updateHighlights();
	});

	const startSelection = vscode.commands.registerCommand('flash-vscode.startSelection', () => {
		updateFlashVscodeMode(flashVscodeModes.selection);
		isSelection = true;
		_start();
		updateHighlights();
	});

	// Exit navigation mode (clear decorations and reset state)
	const exit = vscode.commands.registerCommand('flash-vscode.exit', () => {
		if (!active) { return; };
		// Clear all decorations
		for (const editor of vscode.window.visibleTextEditors) {
			editor.setDecorations(dimDecoration, []);
			editor.setDecorations(matchDecoration, []);
			editor.setDecorations(labelDecoration, []);
			editor.setDecorations(labelDecorationQuestion, []);
		}
		active = false;
		prevSearchQuery = searchQuery;
		searchQuery = '';
		isSelection = false;
		allMatchSortByRelativeDis = undefined;
		nextMatchIndex = undefined;
		labelMap.clear();
		symbols = [];
		vscode.commands.executeCommand('setContext', 'flash-vscode.active', false);
		updateFlashVscodeMode(flashVscodeModes.idle);
		vscode.window.setStatusBarMessage('');
	});

	// Handle backspace: remove last character of query
	const backspaceHandler = vscode.commands.registerCommand('flash-vscode.backspace', () => {
		if (!active) { return; };
		if (searchQuery.length > 0) {
			searchQuery = searchQuery.slice(0, -1);
			updateHighlights();
		} else {
			// If query is empty, exit navigation (nothing to delete)
			vscode.commands.executeCommand('flash-vscode.exit');
		}
	});

	const jump = (target: { editor: vscode.TextEditor, position: vscode.Position, range?: vscode.Range }, scroll: boolean = false) => {
		const targetEditor = target.editor;
		const targetPos = target.position;

		// If a range is provided (treesitter/symbol mode), select the full range
		// This gives us scope-based selection like flash.nvim's treesitter feature
		if (target.range && isMode(flashVscodeModes.symbol)) {
			// Select the entire scope range (e.g., function () {} selects from f to })
			targetEditor.selection = new vscode.Selection(target.range.start, target.range.end);
			targetEditor.revealRange(target.range, scroll ? vscode.TextEditorRevealType.InCenter : vscode.TextEditorRevealType.Default);
		} else {
			// Normal selection behavior
			const isForward = targetEditor.selection.anchor.isBefore(targetPos);
			const selectFrom = isSelection || isMode(flashVscodeModes.selection) ? isForward ? targetEditor.selection.start : targetEditor.selection.end : targetPos;
			const selectTo = isSelection || isMode(flashVscodeModes.selection) ? new vscode.Position(targetPos.line, targetPos.character + (isForward ? 1 : 0)) : targetPos;
			targetEditor.selection = new vscode.Selection(selectFrom, selectTo);
			targetEditor.revealRange(new vscode.Range(targetPos, targetPos), scroll ? vscode.TextEditorRevealType.InCenter : vscode.TextEditorRevealType.Default);
		}

		// If the target is in a different editor, focus that editor
		if (vscode.window.activeTextEditor !== targetEditor) {
			vscode.window.showTextDocument(targetEditor.document, targetEditor.viewColumn);
		}
	};

	const handleEnterOrShiftEnter = (chr: string) => {
		if (searchQuery.length === 0) {
			let selectedText = '';
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				selectedText = editor.document.getText(editor.selection);
			}
			if (selectedText.length > 0 && selectedText.length < 100 && !selectedText.includes('\n')) {
				searchQuery = selectedText;
			} else {
				searchQuery = prevSearchQuery;
			}
			updateHighlights();
		}
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor && allMatches.length > 0) {
			const cursorPos = activeEditor.selection.active;
			let target: LocationInfo | undefined;
			const curPos = relativeVsCodePosition(cursorPos);
			if (allMatchSortByRelativeDis === undefined || prevSortKey !== searchQuery) {
				allMatchSortByRelativeDis = allMatches.filter(m => m.editor === activeEditor).sort((a, b) => a.relativeDis - b.relativeDis);
				prevSortKey = searchQuery;
			}
			if (chr === 'shiftEnter') {
				if (nextMatchIndex !== undefined) {
					nextMatchIndex = nextMatchIndex - 1;
				} else {
					// First press: find first match after cursor, then go one before
					const firstAfter = allMatchSortByRelativeDis.findIndex(m => m.relativeDis > curPos);
					if (firstAfter === -1) {
						// No match after cursor, so go to last match
						nextMatchIndex = allMatchSortByRelativeDis.length - 1;
					} else {
						// Go to the match before the first one after cursor
						nextMatchIndex = firstAfter - 1;
					}
				}
				// Wrap to end if we went before the first match
				if (nextMatchIndex < 0) {
					nextMatchIndex = allMatchSortByRelativeDis.length - 1;
				}
			}
			else {
				nextMatchIndex = nextMatchIndex !== undefined ? nextMatchIndex + 1 : allMatchSortByRelativeDis.findIndex(m => m.relativeDis > curPos);
				// Wrap to beginning if no match found after cursor or if we exceeded the array
				if (nextMatchIndex < 0 || nextMatchIndex >= allMatchSortByRelativeDis.length) {
					nextMatchIndex = 0;
				}
			}
			target = allMatchSortByRelativeDis[ nextMatchIndex! ];
			if (target) {
				jump({ editor: target.editor, position: target.matchStart, range: target.range }, true);
				updateHighlights();
			}
		}
		else {
			vscode.window.showWarningMessage("No match found");
		}
		return;
	};

	const throttledHandleEnterOrShiftEnter = throttle(handleEnterOrShiftEnter, 70);
	// const throttledHandleEnterOrShiftEnter250 = throttle(handleEnterOrShiftEnter, 250);

	// Auto-scroll to matches if all matches are outside visible range
	const autoScrollToMatchIfNeeded = () => {
		const activeEditor = vscode.window.activeTextEditor;
		let isVisible = true;
		if (activeEditor && allMatches.length > 0) {
			// Since allMatches is sorted with active editor matches first,
			// check if the first match is from active editor and if it's visible
			const firstMatch = allMatches[ 0 ];

			if (firstMatch.editor === activeEditor) {
				isVisible = activeEditor.visibleRanges.some(visibleRange =>
					firstMatch.matchStart.line >= visibleRange.start.line &&
					firstMatch.matchStart.line <= visibleRange.end.line
				);
			}

		}

		if (!isVisible) {
			jump({ editor: allMatches[ 0 ].editor, position: allMatches[ 0 ].matchStart }, true)
			// Reset navigation state so manual enter/shift+enter starts fresh
			allMatchSortByRelativeDis = undefined;
			nextMatchIndex = undefined;
		}
	};

	// Override the 'type' command to capture alphanumeric/symbol keys while in nav mode
	const handleLine = (direction: string) => {
		_start();
		updateFlashVscodeMode(direction);
		searchQuery = '';
		updateHighlights();
	};

	const handleSymbol = () => {
		_start();
		updateFlashVscodeMode(flashVscodeModes.symbol);
		searchQuery = '';
		updateHighlights();
	};

	const handleSymbolSelection = () => {
		_start();
		updateFlashVscodeMode(flashVscodeModes.symbol);
		// Set selection flag to trigger treesitter-style selection
		isSelection = true;
		searchQuery = '';
		updateHighlights();
	};

	const handleInput = (chr: string) => {
		if (chr === 'space') {
			chr = ' ';
		}

		const text = chr;
		if (!text) {
			return; // nothing to handle
		}

		switch (chr) {
			case flashVscodeModes.symbol:
				handleSymbol();
				return;
			case 'symbolSelection':
				handleSymbolSelection();
				return;
			case flashVscodeModes.lineUp:
				handleLine(flashVscodeModes.lineUp);
				return;
			case flashVscodeModes.lineDown:
				handleLine(flashVscodeModes.lineDown);
				return;
			case 'enter':
			case 'shiftEnter':
				throttledHandleEnterOrShiftEnter(chr);
				return;
			default:
				if (labelMap.size > 0 && labelMap.has(text)) {
					// We have a label matching this key – perform the jump
					const target = labelMap.get(text)!;
					jump(target);
					// Exit navigation mode after jumping
					vscode.commands.executeCommand('flash-vscode.exit');
					return;
				}
				// Append typed character to the search query
				searchQuery += text;
				// throttledHandleEnterOrShiftEnter250();

				// Auto-scroll to matches if all matches are outside visible range
				autoScrollToMatchIfNeeded();
				updateHighlights();
		}

	};

	// Listen to editor scroll/visible range changes to update highlights in real-time
	const visChange = vscode.window.onDidChangeTextEditorVisibleRanges(event => {
		if (active) {
			// Recompute highlights (this will use the same searchQuery)
			updateHighlights();
		}
	});
	const configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('flash-vscode')) {
			getConfiguration();
			updateHighlights();
		}
	});

	let allChars = searchChars.split('').concat([ 'space', 'symbolSelection', ...Object.values(flashVscodeModes) ]);
	context.subscriptions.push(configChangeListener, start, startSelection, exit, backspaceHandler, visChange,
		...allChars.map(c => vscode.commands.registerCommand(`flash-vscode.jump.${c}`, () => handleInput(c)))
	);
}

export function deactivate() {
	// Clean up if needed (usually not much to do here for this extension)
}
