import { defineConfig } from 'vite';
import dynamicImport from 'vite-plugin-dynamic-import';
import { VitePWA } from 'vite-plugin-pwa';

// export default defineConfig({
export default defineConfig(({ mode }) => {
	return {
		define: {
			global: 'window', // Add `global` for pouchdb
		},
		plugins: [
			dynamicImport(),
			VitePWA({ registerType: 'autoUpdate' }), // eslint-disable-line new-cap
		],
		optimizeDeps: {
			exclude: ('development' != mode) ? undefined : [
				'@elemental/helium',
				'@elemental/localization',
				'@elemental/remote-web-object',
				'@elemental/utils',
				'@inclusio/base',
				'@inclusio/server',
				'@inclusio/documents',
			],
		},
	};
});
