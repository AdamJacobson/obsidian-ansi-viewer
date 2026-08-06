import { App, PluginSettingTab, Setting } from "obsidian";
import AnsiViewerPlugin from "./main";

export interface AnsiViewerSettings {
	correctIterm2Formatting: boolean;
	newLineFormattingReset: boolean;
	darkBackground: string;
	darkForeground: string;
	lightBackground: string;
	lightForeground: string;
	darkBlack: string;
	lightBlack: string;
	darkRed: string;
	lightRed: string;
	darkGreen: string;
	lightGreen: string;
	darkYellow: string;
	lightYellow: string;
	darkBlue: string;
	lightBlue: string;
	darkMagenta: string;
	lightMagenta: string;
	darkCyan: string;
	lightCyan: string;
	darkWhite: string;
	lightWhite: string;
	darkBrightnessOffset: number;
	lightBrightnessOffset: number;
}

export const DEFAULT_SETTINGS: AnsiViewerSettings = {
	correctIterm2Formatting: true,
	newLineFormattingReset: true,
	darkBackground: '#1e1e1e',
	darkForeground: '#d4d4d4',
	lightBackground: '#fafafa',
	lightForeground: '#1e1e1e',
	darkBlack: '#000000',
	lightBlack: '#000000',
	darkRed: '#ff0000',
	lightRed: '#ff0000',
	darkGreen: '#00ff00',
	lightGreen: '#00ff00',
	darkYellow: '#ffff00',
	lightYellow: '#ffff00',
	darkBlue: '#0000ff',
	lightBlue: '#0000ff',
	darkMagenta: '#ff00ff',
	lightMagenta: '#ff00ff',
	darkCyan: '#00ffff',
	lightCyan: '#00ffff',
	darkWhite: '#ffffff',
	lightWhite: '#ffffff',
	darkBrightnessOffset: 25,
	lightBrightnessOffset: 25,
}

export type ColorMode = 'dark' | 'light';

type ColorKey =
	| 'darkBackground' | 'darkForeground'
	| 'lightBackground' | 'lightForeground'
	| 'darkBlack' | 'lightBlack'
	| 'darkRed' | 'lightRed'
	| 'darkGreen' | 'lightGreen'
	| 'darkYellow' | 'lightYellow'
	| 'darkBlue' | 'lightBlue'
	| 'darkMagenta' | 'lightMagenta'
	| 'darkCyan' | 'lightCyan'
	| 'darkWhite' | 'lightWhite';

export interface ColorOption {
	name: string;
	cssVar: string;
	keys: Record<ColorMode, ColorKey>;
}

export const COLOR_OPTIONS: ColorOption[] = [
	{ name: 'Background', cssVar: '--ansi-viewer-bg', keys: { dark: 'darkBackground', light: 'lightBackground' } },
	{ name: 'Text', cssVar: '--ansi-viewer-fg', keys: { dark: 'darkForeground', light: 'lightForeground' } },
	{ name: 'Black', cssVar: '--ansi-black-fg', keys: { dark: 'darkBlack', light: 'lightBlack' } },
	{ name: 'Red', cssVar: '--ansi-red-fg', keys: { dark: 'darkRed', light: 'lightRed' } },
	{ name: 'Green', cssVar: '--ansi-green-fg', keys: { dark: 'darkGreen', light: 'lightGreen' } },
	{ name: 'Yellow', cssVar: '--ansi-yellow-fg', keys: { dark: 'darkYellow', light: 'lightYellow' } },
	{ name: 'Blue', cssVar: '--ansi-blue-fg', keys: { dark: 'darkBlue', light: 'lightBlue' } },
	{ name: 'Magenta', cssVar: '--ansi-magenta-fg', keys: { dark: 'darkMagenta', light: 'lightMagenta' } },
	{ name: 'Cyan', cssVar: '--ansi-cyan-fg', keys: { dark: 'darkCyan', light: 'lightCyan' } },
	{ name: 'White', cssVar: '--ansi-white-fg', keys: { dark: 'darkWhite', light: 'lightWhite' } },
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
			.setDesc('Remove the extra color parameter iTerm2 inserts when you copy output with control sequences and handle use of colons instead of semicolons. Also, corrects the codes for bright background colors being offset by 8.')
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
			const offsetKey = (mode === 'dark' ? 'darkBrightnessOffset' : 'lightBrightnessOffset') as 'darkBrightnessOffset' | 'lightBrightnessOffset';

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
						this.plugin.settings[offsetKey] = DEFAULT_SETTINGS[offsetKey];
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

			new Setting(containerEl)
				.setName('Bright color offset')
				.setDesc('Lightness added to a base color to produce its bright variant.')
				.addSlider(slider => slider
					.setLimits(0, 100, 1)
					.setValue(this.plugin.settings[offsetKey])
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings[offsetKey] = value;
						await this.plugin.saveSettings();
					}));
		}
	}
}
