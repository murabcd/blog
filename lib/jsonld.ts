export function serializeJsonLd(value: unknown) {
	return JSON.stringify(value).replace(/[<>&]/g, (character) => {
		switch (character) {
			case "<":
				return "\\u003c";
			case ">":
				return "\\u003e";
			case "&":
				return "\\u0026";
			default:
				return character;
		}
	});
}
