import { MarkdownPostProcessorContext, Plugin, sanitizeHTMLToDom } from 'obsidian';
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
			const target = el.createEl('pre', { cls: 'rendered-ansi-block' });

			const mode = blockMode(el, ctx);
			if (mode === 'dark') {
				target.style.setProperty('--ansi-viewer-bg', this.settings.darkBackground);
				target.style.setProperty('--ansi-viewer-fg', this.settings.darkForeground);
			} else if (mode === 'light') {
				target.style.setProperty('--ansi-viewer-bg', this.settings.lightBackground);
				target.style.setProperty('--ansi-viewer-fg', this.settings.lightForeground);
			}

			const innerHTML = rows.map(row => {
				const preparsed = ansiEscapePreparser.parse(row);
				const html = ansiUp.ansi_to_html(preparsed);
				return html;
			}).join('\n');

			target.appendChild(sanitizeHTMLToDom(innerHTML))
		};

		const blockMode = (el: HTMLElement, ctx: MarkdownPostProcessorContext): 'dark' | 'light' | null => {
			const args = codeBlockArgs(el, ctx);
			if (!args) return null;
			if (args.includes('dark')) return 'dark';
			if (args.includes('light')) return 'light';
			return null;
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
