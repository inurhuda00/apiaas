"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type BeaconFn = () => {
	url: string;
	data: Record<string, unknown>;
	token?: string;
} | null;

export function useUnsavedChangesGuard({
	shouldBlock,
	confirmationMessage = "You have unsaved changes. Are you sure you want to leave this page?",
	onBeforeLeave,
	sendBeaconData,
}: {
	shouldBlock: boolean;
	confirmationMessage?: string;
	onBeforeLeave?: () => Promise<void> | void;
	sendBeaconData?: BeaconFn;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const prevPathRef = useRef(pathname);
	const clickType = typeof document !== "undefined" && document.ontouchstart ? "touchstart" : "click";

	const sendBeacon = useCallback((fn?: BeaconFn) => {
		if (!fn) return;
		const data = fn();
		if (!data) return;

		const payload = {
			...data.data,
			_authorization: data.token || data.data.token,
		};
		navigator.sendBeacon(data.url, new Blob([JSON.stringify(payload)], { type: "application/json" }));
	}, []);

	const cleanup = useCallback(async () => {
		if (!shouldBlock) return;
		if (onBeforeLeave) await onBeforeLeave();
		sendBeacon(sendBeaconData);
	}, [shouldBlock, onBeforeLeave, sendBeaconData, sendBeacon]);

	// Handle beforeunload event (tab/window close)
	const handleBeforeUnload = useCallback(
		(e: BeforeUnloadEvent) => {
			if (!shouldBlock) return;

			e.preventDefault();
			e.returnValue = ""; // Required for browsers to show a native dialog
			sendBeacon(sendBeaconData);
			return "";
		},
		[shouldBlock, sendBeaconData, sendBeacon],
	);

	// Handle click on anchor tags to confirm navigation
	const clickHandler = useCallback(
		(event: MouseEvent | TouchEvent) => {
			if (!shouldBlock) return;

			// Check if it's a primary mouse button click with no modifiers
			if ((event as MouseEvent).button || (event as MouseEvent).which !== 1) return;
			if (
				(event as MouseEvent).metaKey ||
				(event as MouseEvent).ctrlKey ||
				(event as MouseEvent).shiftKey ||
				(event as MouseEvent).altKey
			)
				return;

			const target = event.target as HTMLElement;
			const linkElement = target.closest("a");
			if (!linkElement) return;

			const newPath = linkElement.getAttribute("href");
			// Skip if it's not a relative path or is the current path
			if (!newPath || newPath.startsWith("http") || newPath === pathname) return;

			event.preventDefault();
			if (window.confirm(confirmationMessage)) {
				cleanup().then(() => {
					router.push(newPath);
				});
			}
		},
		[shouldBlock, confirmationMessage, pathname, router, cleanup],
	);

	// Handle popstate event (browser back/forward button)
	const popStateHandler = useCallback(
		(event: PopStateEvent) => {
			if (!shouldBlock) return;

			// If the user pressed back and we have unsaved changes
			if (event.state === null) {
				if (window.confirm(confirmationMessage)) {
					cleanup().then(() => {
						window.removeEventListener("popstate", popStateHandler);
						history.back();
					});
				} else {
					// Stay on current page
					history.pushState(null, "", pathname);
				}
			}
		},
		[shouldBlock, confirmationMessage, pathname, cleanup],
	);

	// Update path change detection
	useEffect(() => {
		if (prevPathRef.current !== pathname && shouldBlock) {
			cleanup();
		}
		prevPathRef.current = pathname;
	}, [pathname, shouldBlock, cleanup]);

	// Set up all event listeners
	useEffect(() => {
		if (!shouldBlock) return;

		// Push current state to history to detect back button
		history.pushState(null, "", pathname);

		// Set up event listeners
		window.addEventListener("beforeunload", handleBeforeUnload);
		window.addEventListener("popstate", popStateHandler);
		document.addEventListener(clickType, clickHandler, { capture: true });

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			window.removeEventListener("popstate", popStateHandler);
			document.removeEventListener(clickType, clickHandler, { capture: true });
		};
	}, [shouldBlock, pathname, handleBeforeUnload, popStateHandler, clickHandler, clickType]);

	return {
		confirmNavigation: useCallback(async () => {
			if (!shouldBlock) return true;
			if (!window.confirm(confirmationMessage)) return false;
			await cleanup();
			return true;
		}, [shouldBlock, confirmationMessage, cleanup]),
	};
}
