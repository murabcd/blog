import {
	buildOgImage,
	defaultAlt,
	defaultContentType,
	defaultSize,
} from "@/app/_meta/og-image";

export const alt = defaultAlt;
export const size = defaultSize;
export const contentType = defaultContentType;

export default function Image() {
	return buildOgImage("Code");
}
