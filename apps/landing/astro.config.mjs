import tailwindcss from "@tailwindcss/vite";
import { varlockVitePlugin } from "@varlock/vite-integration";
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [
			varlockVitePlugin({ ssrInjectMode: "auto-load" }),
			tailwindcss(),
		],
	},
});
