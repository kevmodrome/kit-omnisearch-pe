<script lang="ts">
	import { page } from "$app/state";

	let {
		type,
		value,
		color = "blue",
	}: {
		type: string;
		value: string;
		color?: "blue" | "green" | "purple" | "orange";
	} = $props();

	function removeFilterHref() {
		const params = new URLSearchParams(page.url.search);

		if (type === "tags") {
			const tags = params.getAll("tags");
			params.delete("tags");
			for (const tag of tags) {
				if (tag !== value) {
					params.append("tags", tag);
				}
			}
		} else {
			params.delete(type);
		}

		const queryString = params.toString();
		return queryString ? `/?${queryString}` : "/";
	}
</script>

<span class="filter-pill {color}">
	<span class="filter-type">{type}</span>: {value}
	<a href={removeFilterHref()} class="filter-remove">×</a>
</span>
