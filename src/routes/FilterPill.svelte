<!-- FilterPill.svelte -->
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

	const colors = {
		blue: "bg-blue-100",
		green: "bg-green-100",
		purple: "bg-purple-100",
		orange: "bg-orange-100",
	};

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

<span
	class="inline-flex items-center gap-1 px-2 py-1 {colors[
		color
	]} rounded text-sm"
>
	<span class="capitalize">{type}</span>: {value}
	<a href={removeFilterHref()} class="text-red-500 hover:text-red-700">×</a>
</span>
