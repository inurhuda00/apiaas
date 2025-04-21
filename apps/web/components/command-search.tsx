"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import axios from "axios";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { env } from "@/env";

type SearchResult = {
	id: number;
	name: string;
	slug: string;
	locked: boolean;
	categoryId: number;
	categoryName: string;
	categorySlug: string;
	imageUrl: string | null;
};

export function CommandSearch() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounce(query, 300);
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isMac, setIsMac] = useState(false);

	useEffect(() => {
		setIsMac(navigator.platform.toUpperCase().includes("MAC"));
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const searchProducts = useCallback(async () => {
		if (!open || debouncedQuery.length < 2) {
			setResults([]);
			return;
		}

		setIsLoading(true);

		try {
			const { data } = await axios.get(`${env.NEXT_PUBLIC_BACKEND_URL}/v1/search/products`, {
				params: { query: debouncedQuery },
			});

			setResults(data.success ? data.data : []);
		} catch (error) {
			console.error("Search error:", error);
			setResults([]);
		} finally {
			setIsLoading(false);
		}
	}, [debouncedQuery, open]);

	useEffect(() => {
		searchProducts();
	}, [searchProducts]);

	const handleSelect = (result: SearchResult) => {
		setOpen(false);
		router.push(`/${result.categorySlug}/${result.slug}`);
	};

	return (
		<>
			<div className="relative">
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
					aria-label="Search"
				>
					<Icons.Search className="size-5" />
					<Badge variant="outline" className="text-xs font-normal hidden sm:flex items-center py-0 h-5 px-1.5">
						{isMac ? "⌘" : "Ctrl+"}K
					</Badge>
				</button>
			</div>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search for resources..." value={query} onValueChange={setQuery} className="px-4" />
				<CommandList>
					{isLoading && (
						<div className="py-6 text-center text-sm">
							<Icons.Spinner className="mr-2 h-4 w-4 animate-spin inline-block" />
							Searching...
						</div>
					)}

					{!isLoading && (
						<>
							<CommandEmpty>No results found.</CommandEmpty>
							{results.length > 0 && (
								<CommandGroup heading="Products">
									{results.map((result) => (
										<CommandItem
											key={result.id}
											value={result.name}
											onSelect={() => handleSelect(result)}
											className="flex items-center gap-2 px-4 py-3"
										>
											<div className="flex-shrink-0 h-10 w-10 overflow-hidden rounded">
												{result.imageUrl ? (
													<Image
														src={result.imageUrl}
														alt={result.name}
														width={40}
														height={40}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="h-full w-full bg-muted flex items-center justify-center">
														<Icons.Image className="h-5 w-5 text-muted-foreground" />
													</div>
												)}
											</div>
											<div className="flex flex-col">
												<span className="font-medium">{result.name}</span>
												<span className="text-xs text-muted-foreground">{result.categoryName}</span>
											</div>
											{result.locked && (
												<div className="ml-auto">
													<span className="bg-primary/15 text-primary text-xs px-1.5 py-0.5 rounded">PRO</span>
												</div>
											)}
										</CommandItem>
									))}
								</CommandGroup>
							)}
						</>
					)}
				</CommandList>
			</CommandDialog>
		</>
	);
}
