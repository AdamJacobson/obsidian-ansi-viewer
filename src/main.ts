import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, AnsiViewerSettings, AnsiViewerSettingTab } from "./settings";
import { AnsiUp } from 'ansi_up';
import { ViewUpdate, PluginValue, EditorView, ViewPlugin } from '@codemirror/view';

class AnsiViewerPluginValue implements PluginValue {
	constructor(view: EditorView) {
		// ...
	}

	update(update: ViewUpdate) {
		// ...
	}

	destroy() {
		// ...
	}
}

export const ansiViewerPlugin = ViewPlugin.fromClass(AnsiViewerPluginValue);

export default class AnsiViewerPlugin extends Plugin {
	settings: AnsiViewerSettings;

	async onload() {
		await this.loadSettings();

		window.ansi_up = new AnsiUp();

		console.log('Loading ansi viewer plugin');

		// this.addCommand({
		// 	id: 'insert-todays-date',
		// 	name: 'Insert today\'s date',
		// 	editorCallback: (editor: Editor) => {
		// 		editor.replaceRange(
		// 			moment().format('YYYY-MM-DD'),
		// 			editor.getCursor()
		// 		);
		// 	},
		// });

		// Only runs for fenced blocks like ```ansi ... ``` (language id "ansi").
		// this.registerMarkdownCodeBlockProcessor('ansi', (source, el) => {
		// 	console.log('Processing ANSI code block');

		// 	const ansiUp = new AnsiUp();
		// 	const html = ansiUp.ansi_to_html(source);
		// 	console.log('HTML:', html);
		// 	// const parser = new DOMParser();
		// 	// const doc = parser.parseFromString(html, 'text/html');
		// 	const target = el.createEl('code', {cls: 'language-ansi'});
		// 	// const fragment = document.createDocumentFragment();

		// 	// while (doc.body.firstChild) {
		// 	// 	fragment.appendChild(doc.body.firstChild);
		// 	// }

		// 	target.innerHTML = html;
		// });

		const ALL_EMOJIS: Record<string, string> = {
			':+1:': '👍',
			':sunglasses:': '😎',
			':smile:': '😄',
		};

		// This only works when the document is in editing mode with live preview enabled
		this.registerMarkdownPostProcessor((element, context) => {
			const codeblocks = element.findAll('code');

			for (let codeblock of codeblocks) {
				const text = codeblock.innerText.trim();
				if (text[0] === ':' && text[text.length - 1] === ':') {
					const emojiEl = codeblock.createSpan({
						text: ALL_EMOJIS[text] ?? text,
					});
					codeblock.replaceWith(emojiEl);
				}
			}
		});

		const renderCsvCodeBlock = (source: string, el: HTMLElement) => {
			const rows = source.split('\n').filter((row) => row.length > 0);

			const table = el.createEl('table');
			const body = table.createEl('tbody');

			for (let i = 0; i < rows.length; i++) {
				const cols = rows[i].split(',');

				const row = body.createEl('tr');

				for (let j = 0; j < cols.length; j++) {
					row.createEl('td', { text: cols[j] });
				}
			}
		};

		this.registerMarkdownCodeBlockProcessor('csv', renderCsvCodeBlock);

		const renderAnsiCodeBlock = (source: string, el: HTMLElement) => {
			const ansiUp = new AnsiUp();
			const html = ansiUp.ansi_to_html(source);
			console.log('HTML:', html);
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			const target = el.createEl('code', {cls: 'language-ansi'});
			const fragment = document.createDocumentFragment();

			while (doc.body.firstChild) {
				fragment.appendChild(doc.body.firstChild);
			}

			target.appendChild(fragment);
		};

		const renderAnsiCodeBlockAlt = (source: string, el: HTMLElement) => {
			const rows = source.split('\n').filter((row) => row.length > 0);

			const wrapper = el.createEl('code', { cls: 'something' });

			for (let i = 0; i < rows.length; i++) {
				wrapper.createEl('span', { text: rows[i], cls: 'red' });
			}
		};

		// this.registerMarkdownCodeBlockProcessor('ansi', renderAnsiCodeBlock);
		this.registerMarkdownCodeBlockProcessor('ansi', renderAnsiCodeBlockAlt);

		// This only works when the document is in reading mode
		// this.registerMarkdownCodeBlockProcessor('ansi', (source, el) => {
		// 	console.log('Processing ANSI code block');

		// 	const ansiUp = new AnsiUp();
		// 	const html = ansiUp.ansi_to_html(source);
		// 	console.log('HTML:', html);
		// 	const parser = new DOMParser();
		// 	const doc = parser.parseFromString(html, 'text/html');
		// 	const target = el.createEl('code', {cls: 'language-ansi'});
		// 	const fragment = document.createDocumentFragment();

		// 	while (doc.body.firstChild) {
		// 		fragment.appendChild(doc.body.firstChild);
		// 	}

		// 	target.appendChild(fragment);
		// });

		// this.registerMarkdownCodeBlockProcessor('ansi', (source, el) => {
		// 	console.log('Processing ANSI code block using innerHTML');

		// 	const ansiUp = new AnsiUp();
		// 	const html = ansiUp.ansi_to_html(source);
		// 	console.log('HTML:', html);

		// 	const target = el.createEl('code', {cls: 'language-ansi'});

		// 	target.innerHTML = html;
		// });

		// this.addRibbonIcon('dice', 'Greet', () => {
		// 	new Notice('Hello, world!');
		// });

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status bar text');

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-modal-simple',
		// 	name: 'Open modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'replace-selected',
		// 	name: 'Replace selected content',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		editor.replaceSelection('Sample editor command');
		// 	}
		// });
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-modal-complex',
		// 	name: 'Open modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 		return false;
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AnsiViewerSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	new Notice("Click");
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log('Unloading ansi viewer plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<AnsiViewerSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		let {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }
