import { App, PluginSettingTab, Setting } from "obsidian";
import AnsiViewerPlugin from "./main";

export interface AnsiViewerSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: AnsiViewerSettings = {
	mySetting: 'default'
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

		new Setting(containerEl)
			.setName('Settings #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
