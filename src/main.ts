import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, AnsiViewerSettings, AnsiViewerSettingTab } from "./settings";
import { AnsiUp } from 'ansi_up';

export default class AnsiViewerPlugin extends Plugin {
	settings: AnsiViewerSettings;

	async onload() {
		await this.loadSettings();

		const renderAnsiCodeBlock = (source: string, el: HTMLElement) => {
			const rows = source.split('\n');
			const ansiUp = new AnsiUp();

			const target = el.createEl('pre', { cls: 'rendered-ansi-block' });

			const innerHTML = rows.map(row => {
				return ansiUp.ansi_to_html(row);
			}).join('\n');

			// eslint-disable-next-line @microsoft/sdl/no-inner-html
			target.innerHTML = innerHTML
		};

		this.registerMarkdownCodeBlockProcessor('ansi', renderAnsiCodeBlock);

		this.addSettingTab(new AnsiViewerSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<AnsiViewerSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
