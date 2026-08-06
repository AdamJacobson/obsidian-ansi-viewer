import type { AnsiViewerSettings } from "./settings";

const ESC = '\x1B';
const ESCAPE_SEQUENCE_LITERALS: string[] = ['\\x1b', '\\x1B', '\\033', '\\e', '\\u001b', '\\u001B'];

export default class AnsiPreparser {
	constructor(private readonly getSettings: () => AnsiViewerSettings) {}

	parse(ansi: string, escapeStrings: boolean): string {
		if (ansi.length === 0) {
			return ansi;
		}

		let preparsed = ansi;

		if (escapeStrings) {
			// ansi_up can only handle the real escape sequence. Replace string literal escapes with the real thing if configured to
			preparsed = this.replaceEscapeSequenceLiterals(preparsed);
		}

		if (this.getSettings().newLineFormattingReset) {
			preparsed = this.resetFormattingOnNewLine(preparsed);
		}

		if (this.getSettings().correctIterm2Formatting) {
			preparsed = this.correctForIterm2Formatting(preparsed);
		}

		return preparsed;
	}

	replaceEscapeSequenceLiterals(ansi: string): string {
		let escaped = ansi;
		for (const seq of ESCAPE_SEQUENCE_LITERALS) {
			escaped = escaped.split(seq).join(ESC);
		}
		return escaped;
	}

	resetFormattingOnNewLine(ansi: string): string {
		return ansi.concat(`${ESC}[0m`);
	}

	correctForIterm2Formatting(ansi: string): string {
		let corrected = this.removeSpuriousOne(ansi);
		corrected = this.correctBrightBackgroundOffset(corrected);
		return this.replaceColonsInCsi(corrected);
	}

	// Start with the escape character, literal bracket and anything until the next 'm' character.
	ansiCodeSequence = new RegExp(`${ESC}([^${ESC}m]*?)m`, 'g');

	/**
	 * Within each substring from ESC (`\x1b`) through the next `m`, remove iTerm2's extra `1` in
	 * truecolor SGR: `38:2:1:` → `38:2:` and `48:2:1:` → `48:2:`
	 */
	removeSpuriousOne(ansi: string): string {
		const stripSpuriousOne = (inner: string) =>
			inner
				.replace(/38:2:1:/g, '38:2:')
				.replace(/48:2:1:/g, '48:2:');

		return ansi.replace(this.ansiCodeSequence, (_full, inner: string) => ESC + stripSpuriousOne(inner) + 'm');
	}

	replaceColonsInCsi(ansi: string): string {
		const replaceColon = (inner: string) => inner.replace(/:/g, ';');

		return ansi.replace(this.ansiCodeSequence, (_full, inner: string) => ESC + replaceColon(inner) + 'm');
	}

	/**
	 * iTerm2 uses codes 108 to 115 for bright background colors instead of 100 to 107
	 */
	correctBrightBackgroundOffset(ansi: string): string {
		const correctOffset = (inner: string) => {
			const params = inner.split(';');
			const out = [];

			for (let i = 0; i < params.length; i++) {
				const param = params[i];
				const n = Number(param);

				// 38 and 48 indicate the following codes are color values. Leave these unchanged.
				if (n === 38 || n === 48) {
					let num_codes = 0;
					switch (params[i + 1]) {
						case '2':
							num_codes = 4
							break;
						case '5':
							num_codes = 2
							break;
					}

					out.push(...params.slice(i, i + 1 + num_codes));
					i += num_codes;
					continue;
				}
				out.push(n >= 108 && n <= 115 ? String(n - 8) : param);
			}
			return out.join(';');
		};

		return ansi.replace(this.ansiCodeSequence, (_full, inner: string) => ESC + correctOffset(inner) + 'm');
	}
}
