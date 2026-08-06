import { App, PluginSettingTab, Setting } from "obsidian";
import AnsiViewerPlugin from "./main";

export type DefaultTheme = 'theme' | 'dark' | 'light';

export interface AnsiViewerSettings {
	convertStringEscapeSequences: boolean;
	correctIterm2Formatting: boolean;
	newLineFormattingReset: boolean;
	defaultTheme: DefaultTheme;
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
	convertStringEscapeSequences: true,
	correctIterm2Formatting: true,
	newLineFormattingReset: true,
	defaultTheme: 'theme',
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

		new Setting(containerEl)
			.setName('Default theme')
			.setDesc('How `ansi` blocks are displayed when no theme keyword is present. Override per block with `dark`, `light`, or `theme` (match current theme).')
			.addDropdown(dropdown => dropdown
				.addOption('theme', 'Current theme')
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.addOption('dark', 'ANSI Viewer dark')
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.addOption('light', 'ANSI Viewer light')
				.setValue(this.plugin.settings.defaultTheme)
				.onChange(async (value) => {
					this.plugin.settings.defaultTheme = value as DefaultTheme;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Convert string escape sequences to literal escape sequences')
			.setDesc('Consider strings that would evaluate to the escape sequence as actual escape sequences. Example: "\\x1b", "\\e", "\\033" etc.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.convertStringEscapeSequences)
				.onChange(async (value) => {
					this.plugin.settings.convertStringEscapeSequences = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setName('Correct iTerm2 formatting')
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setDesc("Handle iTerm2's custom 24-bit color and 256-color codes which include an extra 1 as well as use colons. Also, corrects the codes for bright background colors being offset by 8.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.correctIterm2Formatting)
				.onChange(async (value) => {
					this.plugin.settings.correctIterm2Formatting = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Reset formatting on new line')
			.setDesc('Consider each line of a code block as starting with a style reset.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.newLineFormattingReset)
				.onChange(async (value) => {
					this.plugin.settings.newLineFormattingReset = value;
					await this.plugin.saveSettings();
				}));

		for (const mode of ['dark', 'light'] as ColorMode[]) {
			const label = (mode === 'dark' ? 'Dark' : 'Light');
			const offsetKey = (mode === 'dark' ? 'darkBrightnessOffset' : 'lightBrightnessOffset');

			new Setting(containerEl)
				.setName(`${label} mode colors`)
				.setDesc(`Custom colors for \`ansi ${mode}\` blocks, and for all blocks when Default theme is set to ANSI Viewer ${mode}.`)
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
