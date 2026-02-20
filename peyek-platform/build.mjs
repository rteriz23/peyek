import { rollup } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import options from './rollup.config.js';

async function build() {
    try {
        const bundle = await rollup({
            input: options.input,
            plugins: options.plugins,
            onwarn: (warning) => { console.warn(warning.message); }
        });

        for (const outputOptions of options.output) {
            await bundle.write(outputOptions);
        }
        console.log('Build successful!');
    } catch (err) {
        console.error('BUILD ERROR:', err);
    }
}

build();
