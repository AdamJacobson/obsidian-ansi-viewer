import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, AnsiViewerSettings, AnsiViewerSettingTab } from "./settings";
import { AnsiUp } from 'ansi_up';
import AnsiPreparser from "./ansi_preparser";

declare global {
	interface Window {
		ansiUp: AnsiUp;
	}
}

export default class AnsiViewerPlugin extends Plugin {
	settings: AnsiViewerSettings;

	async onload() {
		await this.loadSettings();
		
		const renderAnsiCodeBlock = (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const ansiEscapePreparser = new AnsiPreparser(() => this.settings);
			const ansiUp = new AnsiUp();

			const rows = source.split('\n');
			const cls = isDarkBlock(el, ctx) ? 'rendered-ansi-block dark' : 'rendered-ansi-block';
			const target = el.createEl('pre', { cls });

			const innerHTML = rows.map(row => {
				const preparsed = ansiEscapePreparser.parse(row);
				const html = ansiUp.ansi_to_html(preparsed);
				return html;
			}).join('\n');

			// eslint-disable-next-line @microsoft/sdl/no-inner-html
			target.innerHTML = innerHTML
		};

		const isDarkBlock = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			return (codeBlockArgs(el, ctx)?.includes('dark') ?? false);
		}

		const codeBlockArgs = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const sectionInfo = ctx.getSectionInfo(el);
			if (!sectionInfo) return null;

			const text = sectionInfo.text;
			if (!text) return null;

			const line = text.split("\n")[sectionInfo.lineStart];
			if (!line) return null;

			const match = line.match(/```ansi([^\n]*)/);
			if (!match || match.length < 2) return null;

			return match[1]!.trim().split(" ");
		}

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
