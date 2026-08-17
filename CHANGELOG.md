# 1.0.1

First release of MVP functionality
- Render ANSI formatted text in codeblocks with `ansi` keyword
- Support code block level styles with keywords `dark`, `light` and `theme`
- Can set a global style to be used when keyword missing
- Support code block level escape sequence converstion with keywords `esc_string` and `esc_real`
- Can set a global escape sequence conversation rule when keyword is missing
- Support dealing with iTerm2s quirky codes for multi-bit color and bright background colors
- Can set a global behavior of how to deal with multiline styles
- Configurable dark and light mode with custom colors and brightness offsets