#!/usr/bin/env node

// "build": "esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets",
// https://www.fastruby.io/blog/esbuild/webpacker/javascript/migrate-from-webpacker-to-esbuild.html

const chokidar = require('chokidar');
const esbuild = require('esbuild');
const http = require('http');
const { eslintPlugin } = require('esbuild-plugin-eslinter');
const path = require('path');

const clients = [];
const watch = process.argv.includes('--watch');
const watchedDirectories = [
  './app/javascript/**/*.ts',
  './app/javascript/**/*.js',
  './app/views/**/*.html.erb',
  './app/views/**/*.html.slim',
  './app/assets/builds/**/*.css',
];
const bannerJs = watch ?
  ' (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();' : '';
const reloadScreen = function() {
  clients.forEach((res) => res.write('data: update\n\n'));
  clients.length = 0;
};

const config = {
  entryPoints: ['application.js'],
  bundle: true,
  sourcemap: true,
  outdir: path.join(process.cwd(), 'app/assets/builds'),
  incremental: true,
  absWorkingDir: path.join(process.cwd(), 'app/javascript'),
  banner: { js: bannerJs },
  color: true,
  watch: {
    onRebuild(error, result) {
      if (error) {
        // TODO: write build failed message to client
        // console.error('watch build failed:', error);
      } else {
        console.log('watch build succeeded:', result);
      }
    },
  },
  // custom plugins will be inserted is this array
  plugins: [
    eslintPlugin({ persistLintIssues: true }),
  ],
};

if (watch) {
  http
    .createServer((_req, res) => {
      return clients.push(
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Connection': 'keep-alive',
        }),
      );
    })
    .listen(8082);

  (async () => {
    const result = await esbuild.build(config);
    chokidar.watch(watchedDirectories).on('all', (_event, changedFilePath) => {
      if (changedFilePath.includes('javascript')) {
        console.log(`rebuilding ${changedFilePath}`);
        // TODO: write build failed message to client
        result.rebuild().catch(() => console.log('\u001b[31m✘\u001b[0m rebuild failed'));
      } else {
        reloadScreen();
      }
    });
  })();
} else {
  esbuild.build(config).catch(() => process.exit(1));
}

