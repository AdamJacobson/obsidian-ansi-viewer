import { MarkdownPostProcessorContext, Plugin, sanitizeHTMLToDom } from 'obsidian';
import { DEFAULT_SETTINGS, AnsiViewerSettings, AnsiViewerSettingTab, COLOR_OPTIONS } from "./settings";
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
			ansiUp.use_classes = true;

			const rows = source.split('\n');
			const target = el.createEl('pre', { cls: 'rendered-ansi-block' });

			const mode = blockColorMode(el, ctx);
			if (mode != 'theme') {
				for (const color of COLOR_OPTIONS) {
					target.style.setProperty(color.cssVar, this.settings[color.keys[mode]]);
				}
			}

			const escStrings = blockEscapeMode(el, ctx);

			const brightnessOffset = mode === 'light' ? this.settings.lightBrightnessOffset : this.settings.darkBrightnessOffset;
			target.style.setProperty('--ansi-brightness-offset', String(brightnessOffset));

			const innerHTML = rows.map(row => {
				const preparsed = ansiEscapePreparser.parse(row, escStrings);
				const html = ansiUp.ansi_to_html(preparsed);
				return html;
			}).join('\n');

			target.appendChild(sanitizeHTMLToDom(innerHTML))
		};

		/**
		 * Returns the color mode of the code block.
		 *
		 * Return
		 *   - 'dark'  keyword -> 'dark'
		 *   - 'light' keyword -> 'light'
		 *   - 'theme' keyword -> 'theme' (match the current theme, overriding a dark/light default)
		 *   - no keyword -> global `defaultTheme` setting
		 */
		const blockColorMode = (el: HTMLElement, ctx: MarkdownPostProcessorContext): 'dark' | 'light' | 'theme' => {
			const args = codeBlockArgs(el, ctx);
			if (args) {
				if (args.includes('dark')) return 'dark';
				if (args.includes('light')) return 'light';
				if (args.includes('theme')) return 'theme';
			}

			return this.settings.defaultTheme;
		}

		/**
		 * Returns if the code block should consider string escape sequences as literal escape sequences
		 *
		 * Return:
		 *   - 'esc_real' keyword -> true
		 *   - 'esc_string' keyword -> false
		 *   - no keyword -> global `convertStringEscapeSequences` setting
		 */
		const blockEscapeMode = (el: HTMLElement, ctx: MarkdownPostProcessorContext): boolean => {
			const globalSetting = this.settings.convertStringEscapeSequences;
			const args = codeBlockArgs(el, ctx);
			// Use global setting if block level keyword isn't present
			if (!args) return globalSetting;
			if (args.includes('esc_string')) return true;
			if (args.includes('esc_real')) return false;
			return globalSetting;
		}

		/**
		 * Extract the arguments passed to the code block (all distinct words on the line with "```ansi")
		 */
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
