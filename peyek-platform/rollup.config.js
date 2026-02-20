import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const basePlugins = [resolve(), commonjs()];

function createConfig(name, inputPath, outname) {
  return {
    input: inputPath,
    output: [
      {
        file: `dist/${outname}.js`,
        format: 'umd',
        name: name,
        sourcemap: true,
      },
      {
        file: `dist/${outname}.min.js`,
        format: 'umd',
        name: name,
        plugins: [terser()],
        sourcemap: true,
      }
    ],
    plugins: basePlugins
  };
}

export default [
  createConfig('PeyekCore', 'packages/core/index.js', 'peyek.core'),
  createConfig('PeyekUIBuilder', 'packages/ui-builder/index.js', 'peyek.ui-builder'),
  createConfig('PeyekPDFViewer', 'packages/pdf-viewer/index.js', 'peyek.pdf-viewer'),
  // We can treat core as peyek for now if they just want the base SDK, 
  // or we could make a "master" that imports everything.
];
