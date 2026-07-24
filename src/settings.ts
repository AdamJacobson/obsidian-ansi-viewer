import { App, PluginSettingTab, Setting } from "obsidian";
import AnsiViewerPlugin from "./main";

export interface AnsiViewerSettings {
	correctIterm2Formatting: boolean;
	newLineFormattingReset: boolean;
	darkBackground: string;
	darkForeground: string;
	lightBackground: string;
	lightForeground: string;
}

export const DEFAULT_SETTINGS: AnsiViewerSettings = {
	correctIterm2Formatting: true,
	newLineFormattingReset: true,
	darkBackground: '#1e1e1e',
	darkForeground: '#d4d4d4',
	lightBackground: '#fafafa',
	lightForeground: '#1e1e1e',
}

export type ColorMode = 'dark' | 'light';

type ColorKey = 'darkBackground' | 'darkForeground' | 'lightBackground' | 'lightForeground';

export interface ColorOption {
	name: string;
	cssVar: string;
	keys: Record<ColorMode, ColorKey>;
}

export const COLOR_OPTIONS: ColorOption[] = [
	{ name: 'Background', cssVar: '--ansi-viewer-bg', keys: { dark: 'darkBackground', light: 'lightBackground' } },
	{ name: 'Text', cssVar: '--ansi-viewer-fg', keys: { dark: 'darkForeground', light: 'lightForeground' } },
];

export class AnsiViewerSettingTab extends PluginSettingTab {
	plugin: AnsiViewerPlugin;

	constructor(app: App, plugin: AnsiViewerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// eslint-disable-next-line obsidianmd/settings-tab/no-problematic-settings-headings
		new Setting(containerEl)
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setName('ANSI Viewer settings')
			.setHeading();

		new Setting(containerEl)
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setName('Correct iTerm2 formatting')
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setDesc('Remove the extra color parameter iTerm2 inserts when you copy output with control sequences and handle use of colons instead of semicolons.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.correctIterm2Formatting)
				.onChange(async (value) => {
					this.plugin.settings.correctIterm2Formatting = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Reset formatting on new line.')
			.setDesc('When enabled, formatting will not carry over from the previous line.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.newLineFormattingReset)
				.onChange(async (value) => {
					this.plugin.settings.newLineFormattingReset = value;
					await this.plugin.saveSettings();
				}));

		for (const mode of ['dark', 'light'] as ColorMode[]) {
			const label = (mode === 'dark' ? 'Dark' : 'Light');

			new Setting(containerEl)
				.setName(`${label} mode colors`)
				.setDesc(`Custom colors for \`ansi ${mode}\` blocks. Blocks without a keyword follow the current theme.`)
				.setHeading()
				.addExtraButton(button => button
					.setIcon('rotate-ccw')
					.setTooltip('Reset to default')
					.onClick(async () => {
						for (const color of COLOR_OPTIONS) {
							this.plugin.settings[color.keys[mode]] = DEFAULT_SETTINGS[color.keys[mode]];
						}
						await this.plugin.saveSettings();
						this.display();
					}));

			for (const color of COLOR_OPTIONS) {
				new Setting(containerEl)
					.setName(`${color.name} color`)
					.addColorPicker(picker => picker
						.setValue(this.plugin.settings[color.keys[mode]])
						.onChange(async (value) => {
							this.plugin.settings[color.keys[mode]] = value;
							await this.plugin.saveSettings();
						}));
			}
		}
	}
}
