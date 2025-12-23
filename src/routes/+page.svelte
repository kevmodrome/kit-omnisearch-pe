<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import FilterPill from "./FilterPill.svelte";
	import {
		getAuthors,
		getCategories,
		getTags,
		search,
	} from "./search.remote";

	let searchQuery = $state("");

	let activeTags = $derived(page.url.searchParams.getAll("tags") || null);
	let activeCategory = $derived(page.url.searchParams.get("category") || null);
	let activeAuthor = $derived(page.url.searchParams.get("author") || null);
	let activeSearch = $derived(page.url.searchParams.get("search") || null);

	const hasActiveFilters = $derived(
		activeTags.length > 0 || activeCategory || activeAuthor || activeSearch
	);

	const posts = $derived(
		await search({
			tags: activeTags,
			category: activeCategory,
			author: activeAuthor,
			query: activeSearch,
		}),
	);

	// Fetch filter options from server
	const allTags = $derived(await getTags());
	const allCategories = $derived(await getCategories());
	const allAuthors = $derived(await getAuthors());

	const filterOptions = (array: string[], query: string) => {
		return query
			? array.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
			: [];
	};

	// Build URL with deduplication
	function buildFilterUrl(type: string, value: string): string {
		const params = new URLSearchParams(page.url.searchParams);

		if (type === "tags") {
			const existingTags = params.getAll("tags");
			if (!existingTags.includes(value)) {
				params.append("tags", value);
			}
		} else {
			params.set(type, value);
		}

		return `/?${params.toString()}`;
	}
</script>

<h1>Omnisearch</h1>

<div class="search-container">
	<form method="GET" action="/">
		{#each activeTags as tagValue}
			<input type="hidden" name="tags" value={tagValue} />
		{/each}
		{#if activeCategory}
			<input type="hidden" name="category" value={activeCategory} />
		{/if}
		{#if activeAuthor}
			<input type="hidden" name="author" value={activeAuthor} />
		{/if}
		{#if activeSearch}
			<input type="hidden" name="search" value={activeSearch} />
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
			{#if browser}
				{#each filterOptions(allTags, searchQuery) as tagValue}
					<a href={buildFilterUrl("tags", tagValue)} class="dropdown-item tags">
						{tagValue}
						<span class="dropdown-hint">in tags</span>
					</a>
				{/each}

				{#each filterOptions(allCategories, searchQuery) as categoryValue}
					<a href={buildFilterUrl("category", categoryValue)} class="dropdown-item category">
						{categoryValue}
						<span class="dropdown-hint">in category</span>
					</a>
				{/each}

				{#each filterOptions(allAuthors, searchQuery) as authorValue}
					<a href={buildFilterUrl("author", authorValue)} class="dropdown-item author">
						{authorValue}
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
	{#if hasActiveFilters}
		{#if activeSearch}
			<FilterPill type="search" value={activeSearch} />
		{/if}
		{#each activeTags as tagValue}
			<FilterPill type="tags" value={tagValue} />
		{/each}
		{#if activeCategory}
			<FilterPill type="category" value={activeCategory} />
		{/if}
		{#if activeAuthor}
			<FilterPill type="author" value={activeAuthor} />
		{/if}
		<a href="/" class="clear-all">Clear all</a>
	{:else}
		<span class="no-filters">No active filters</span>
	{/if}
</div>

<h2>Posts ({posts.length})</h2>
{#if posts.length > 0}
	<ul class="posts-list">
		{#each posts as post}
			<li class="post-item">
				<p class="post-body">{post.body}</p>
				<div class="post-meta">
					<span class="post-category">{post.category}</span>
					<span>by {post.author}</span>
					<div class="post-tags">
						{#each post.tags as postTag}
							<span class="post-tag">{postTag}</span>
						{/each}
					</div>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<div class="empty-state">
		<p>No posts match your filters.</p>
		<a href="/">Clear all filters</a>
	</div>
{/if}
