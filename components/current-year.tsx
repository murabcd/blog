"use client";

import { useEffect, useState } from "react";

export function CurrentYear({ initialYear }: { initialYear: number }) {
	const [year, setYear] = useState(initialYear);

	useEffect(() => {
		setYear(new Date().getFullYear());
	}, []);

	return <span>{year}</span>;
}
