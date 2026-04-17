// ansi_up can only handle the real escape sequence. Replace literal escapes with the real escape sequence.
const ESC = '\x1B';

const ESCAPE_SEQUENCE_LITERALS: string[] = ['\\x1b', '\\x1B', '\\033', '\\e', '\\u001b', '\\u001B'];

export default class AnsiPreparser {
	parse(ansi: string): string {
    if (ansi.length === 0) {
      return ansi;
    }

		let escaped = ansi;
		for (const seq of ESCAPE_SEQUENCE_LITERALS) {
			escaped = escaped.split(seq).join(ESC);
		}
		const corrected = this.correctForIterm2Formatting(escaped);
    return this.replaceColonsInCsi(corrected);
	}

	/**
	 * Within each substring from ESC (`\x1b`) through the next `m`, remove iTerm2's extra `1` in
	 * truecolor SGR: `38…2…1…` → `38…2…` and `48…2…1…` → `48…2…` (separators may be `:` or `;`).
	 */
	correctForIterm2Formatting(ansi: string): string {
		const stripSpuriousOne = (inner: string) =>
			inner
				.replace(/38:2:1:/g, '38:2:')
				.replace(/48:2:1:/g, '48:2:');

    // Start with the escape character, literal bracket and anything until the next 'm' character.
		const colorSequence = new RegExp(`${ESC}([^${ESC}m]*?)m`, 'g');
		return ansi.replace(colorSequence, (_full, inner: string) => ESC + stripSpuriousOne(inner) + 'm');
	}

  replaceColonsInCsi(ansi: string): string {
    const replaceColon = (inner: string) => inner.replace(/:/g, ';');

    const colorSequence = new RegExp(`${ESC}([^${ESC}m]*?)m`, 'g');
    return ansi.replace(colorSequence, (_full, inner: string) => ESC + replaceColon(inner) + 'm');
  }
}
