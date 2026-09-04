import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';

const production = !process.env.ROLLUP_WATCH;

const resolvePlugin = () => resolve({
	browser: true,
	dedupe: ['svelte'],
	exportConditions: ['svelte'],
	extensions: ['.mjs', '.js', '.json', '.node', '.svelte']
});

function registerW160Layouts() {
	return {
		name: 'register-w160-layouts',
		transform(code, id) {
			if (!id.replace(/\\/g, '/').endsWith('/src/App.svelte')) return null;

			const importAnchor = "  import logos from './keyboards/ortho_logos_corrected.js';";
			const menuAnchor = '    "ロゴス": logos,';
			if (!code.includes(importAnchor) || !code.includes(menuAnchor)) {
				this.error('W160 dropdown registration anchors not found in App.svelte');
			}

			let out = code.replace(importAnchor, `${importAnchor}\n  import w160Bridge1177 from './keyboards/ortho_w160_1177.js';\n  import w160Production9834 from './keyboards/ortho_w160_9834.js';\n  import w160Conditional1170 from './keyboards/ortho_w160_1170.js';`);
			out = out.replace(menuAnchor, `${menuAnchor}\n    "W160 bridge 1177.348": w160Bridge1177,\n    "W160 production 9834 (1180.694)": w160Production9834,\n    "W160 conditional 1170.637": w160Conditional1170,`);
			return { code: out, map: null };
		}
	};
}

const mainConfig = {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		registerW160Layouts(),
		svelte({
			compilerOptions: {
				dev: !production
			},
			emitCss: true
		}),
		resolvePlugin(),
		commonjs(),
		json(),
		postcss({
			extract: true,
			minimize: production
		}),
		!production && serve(),
		!production && livereload('public'),
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

const w160BenchmarkConfig = {
	input: 'src/w160-benchmark.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'w160Benchmark',
		file: 'public/build/w160-benchmark.js'
	},
	plugins: [
		resolvePlugin(),
		commonjs(),
		json(),
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

export default [mainConfig, w160BenchmarkConfig];

function serve() {
	let started = false;
	const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

	return {
		writeBundle() {
			if (!started) {
				started = true;
				require('child_process').spawn(npmCommand, ['run', 'start', '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: process.platform === 'win32'
				});
			}
		}
	};
}
