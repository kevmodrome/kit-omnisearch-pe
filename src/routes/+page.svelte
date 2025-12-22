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
		return text.replace(regex, "<mark>$1</mark>");
	}
</script>

<h1>Omnisearch without JS</h1>

<div class="search-container">
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

		<div class="search-input-wrapper">
			<input
				type="search"
				name="q"
				placeholder="Enter query..."
				autocomplete="off"
				bind:value={searchQuery}
				class="search-input"
			/>
			<button class="submit-button" name="type" value="all">Submit</button>
		</div>

		<div class="dropdown">
			{#if jsEnabled}
				{#each filterQuery(await getTags(), searchQuery) as tag}
					<a
						href="/?{new URLSearchParams([
							...page.url.searchParams,
							['tags', tag],
						]).toString()}"
						class="dropdown-item tag"
					>
						{@html highlightMatch(tag, searchQuery)}
						<span class="dropdown-hint">in tags</span>
					</a>
				{/each}

				{#each filterQuery(await getCategories(), searchQuery) as category}
					<a
						href="/?{new URLSearchParams([
							...page.url.searchParams,
							['category', category],
						]).toString()}"
						class="dropdown-item category"
					>
						{@html highlightMatch(category, searchQuery)}
						<span class="dropdown-hint">in category</span>
					</a>
				{/each}

				{#each filterQuery(await getAuthors(), searchQuery) as author}
					<a
						href="/?{new URLSearchParams([
							...page.url.searchParams,
							['author', author],
						]).toString()}"
						class="dropdown-item author"
					>
						{@html highlightMatch(author, searchQuery)}
						<span class="dropdown-hint">in author</span>
					</a>
				{/each}

				{#if !searchQuery}
					<span class="dropdown-placeholder">Start typing to search...</span>
				{/if}
			{:else}
				<button name="type" value="tags" class="dropdown-item">
					<strong>{searchQuery}</strong>
					<span class="dropdown-hint">in tags</span>
				</button>
				<button name="type" value="category" class="dropdown-item">
					<strong>{searchQuery}</strong>
					<span class="dropdown-hint">in category</span>
				</button>
				<button name="type" value="author" class="dropdown-item">
					<strong>{searchQuery}</strong>
					<span class="dropdown-hint">in author</span>
				</button>
			{/if}
		</div>
	</form>
</div>

<h2>Active Filters</h2>
<div class="filters-container">
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

<h2>Posts ({posts?.length})</h2>
<ul class="posts-list">
	{#each posts as post}
		<li class="post-item">
			<p class="post-body">{post.body}</p>
			<div class="post-meta">
				<span class="post-category">{post.category}</span>
				<span>by {post.author}</span>
				<div class="post-tags">
					{#each post.tags as tag}
						<span class="post-tag">{tag}</span>
					{/each}
				</div>
			</div>
		</li>
	{/each}
</ul>
