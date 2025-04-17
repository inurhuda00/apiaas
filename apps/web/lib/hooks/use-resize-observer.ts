import { type RefObject, useEffect, useState, useCallback } from "react";

export function useResizeObserver<T extends Element>(elementRef: RefObject<T | null>): ResizeObserverEntry | undefined {
	const [entry, setEntry] = useState<ResizeObserverEntry>();

	const updateEntry = useCallback(([entry]: ResizeObserverEntry[]): void => {
		setEntry(entry);
	}, []);

	useEffect(() => {
		const node = elementRef?.current;
		if (!node) return;

		const observer = new ResizeObserver(updateEntry);

		observer.observe(node);

		return () => observer.disconnect();
	}, [elementRef, updateEntry]);

	return entry;
}
