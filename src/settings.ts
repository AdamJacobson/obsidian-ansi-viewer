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
	lightBackground: '#ffffff',
	lightForeground: '#1e1e1e',
}

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

		new Setting(containerEl)
			.setName('Dark mode colors')
			.setDesc('Custom colors for `ansi dark` blocks. Blocks without a keyword follow the current theme.')
			.setHeading();

		new Setting(containerEl)
			.setName('Background color')
			.addColorPicker(picker => picker
				.setValue(this.plugin.settings.darkBackground)
				.onChange(async (value) => {
					this.plugin.settings.darkBackground = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Text color')
			.addColorPicker(picker => picker
				.setValue(this.plugin.settings.darkForeground)
				.onChange(async (value) => {
					this.plugin.settings.darkForeground = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Light mode colors')
			.setDesc('Custom colors for `ansi light` blocks. Blocks without a keyword follow the current theme.')
			.setHeading();

		new Setting(containerEl)
			.setName('Background color')
			.addColorPicker(picker => picker
				.setValue(this.plugin.settings.lightBackground)
				.onChange(async (value) => {
					this.plugin.settings.lightBackground = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Text color')
			.addColorPicker(picker => picker
				.setValue(this.plugin.settings.lightForeground)
				.onChange(async (value) => {
					this.plugin.settings.lightForeground = value;
					await this.plugin.saveSettings();
				}));
	}
}
