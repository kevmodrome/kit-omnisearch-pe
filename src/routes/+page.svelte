<script lang="ts">
	import { page } from "$app/state";
	import FilterPill from "./FilterPill.svelte";
	import {
		getAuthors,
		getCategories,
		getTags,
		search,
	} from "./search.remote";

	let searchQuery = $state("");
	let jsEnabled = $state(false);

	$effect(() => {
		jsEnabled = true;
	});

	let tags = $derived(page.url.searchParams.getAll("tags") || null);
	let category = $derived(page.url.searchParams.get("category") || null);
	let author = $derived(page.url.searchParams.get("author") || null);
	let query = $derived(page.url.searchParams.get("search") || null);

	const posts = $derived(
		await search({
			tags,
			category,
			author,
			query,
		}),
	);

	const filterQuery = (array: string[], searchQuery: string) => {
		return searchQuery
			? array.filter((item: string) =>
					item.toLowerCase().includes(searchQuery.toLowerCase()),
				)
			: [];
	};

	function highlightMatch(text: string, search: string) {
		if (!search) return text;
		const regex = new RegExp(`(${search})`, "gi");
		return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
	}
</script>

<h1 class="text-3xl font-bold">Omnisearch without JS</h1>
<div class="w-75 group relative m-4">
	<form method="GET" action="/">
		{#each tags as tag}
			<input type="hidden" name="tags" value={tag} />
		{/each}
		{#if category}
			<input type="hidden" name="category" value={category} />
		{/if}
		{#if author}
			<input type="hidden" name="author" value={author} />
		{/if}
		{#if query}
			<input type="hidden" name="search" value={query} />
		{/if}

		<div class="relative">
			<input
				type="search"
				name="q"
				placeholder="Enter query..."
				autocomplete="off"
				bind:value={searchQuery}
				class="w-full py-3 px-4 border border-gray-300 rounded-lg"
			/>
			<button
				class="absolute right-2 top-2 border border-gray-200 rounded-md px-2 py-1"
				name="type"
				value="all">Submit</button
			>
		</div>

		<div
			class="absolute left-0 top-full right-0 grid gap-2 p-2 border rounded-lg bg-white shadow-lg opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible"
		>
			{#if jsEnabled}
				{#each filterQuery(await getTags(), searchQuery) as tag}
					<a
						href="/?{new URLSearchParams([
							...page.url.searchParams,
							['tags', tag],
						]).toString()}"
						class="block py-1 px-2 text-left hover:bg-green-50 rounded"
					>
						{@html highlightMatch(tag, searchQuery)}
						<span class="text-gray-500">in tags</span>
					</a>
				{/each}

				{#each filterQuery(await getCategories(), searchQuery) as category}
					<a
						href="/?{new URLSearchParams([
							...page.url.searchParams,
							['category', category],
						]).toString()}"
						class="block py-1 px-2 text-left hover:bg-purple-50 rounded"
					>
						{@html highlightMatch(category, searchQuery)}
						<span class="text-gray-500">in category</span>
					</a>
				{/each}

				{#each filterQuery(await getAuthors(), searchQuery) as author}
					<a
						href="/?{new URLSearchParams([
							...page.url.searchParams,
							['author', author],
						]).toString()}"
						class="block py-1 px-2 text-left hover:bg-orange-50 rounded"
					>
						{@html highlightMatch(author, searchQuery)}
						<span class="text-gray-500">in author</span>
					</a>
				{/each}
				{#if !searchQuery}
					<span class="py-1 px-2 text-gray-400"
						>Start typing to search...</span
					>
				{/if}
			{:else}
				<button
					name="type"
					value="tags"
					class="py-1 px-2 text-left hover:bg-gray-100 rounded"
				>
					<strong>{query}</strong> in tags
				</button>
				<button
					name="type"
					value="category"
					class="py-1 px-2 text-left hover:bg-gray-100 rounded"
				>
					<strong>{query}</strong> in category
				</button>
				<button
					name="type"
					value="author"
					class="py-1 px-2 text-left hover:bg-gray-100 rounded"
				>
					<strong>{query}</strong> in author
				</button>
			{/if}
		</div>
	</form>
</div>
<h2 class="text-2xl font-semibold">Active Filters</h2>
<div class="flex flex-wrap gap-2 mt-2 p-4 border border-gray-200 rounded-md">
	{#if query}
		<FilterPill type="search" value={query} color="blue" />
	{/if}
	{#each tags as tag}
		<FilterPill type="tags" value={tag} color="green" />
	{/each}
	{#if category}
		<FilterPill type="category" value={category} color="purple" />
	{/if}
	{#if author}
		<FilterPill type="author" value={author} color="orange" />
	{/if}
</div>

<h2 class="text-2xl font-semibold">Posts ({posts?.length})</h2>
<ul class="space-y-4">
	{#each posts as post}
		<li class="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
			<p class="text-gray-800 mb-2">{post.body}</p>
			<div class="flex items-center gap-4 text-sm text-gray-600">
				<span class="px-2 py-1 bg-purple-100 rounded"
					>{post.category}</span
				>
				<span>by {post.author}</span>
				<div class="flex gap-1">
					{#each post.tags as tag}
						<span class="px-2 py-1 bg-green-100 rounded">{tag}</span
						>
					{/each}
				</div>
			</div>
		</li>
	{/each}
</ul>
