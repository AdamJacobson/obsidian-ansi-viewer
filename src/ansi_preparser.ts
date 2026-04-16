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
		return escaped;
	}
}
