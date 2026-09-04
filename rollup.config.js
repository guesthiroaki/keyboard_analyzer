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

const mainConfig = {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
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
