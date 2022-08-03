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
const watchOptions = {
  onRebuild(error, result) {
    if (error) {
      // TODO: write build failed message to client
      // console.error('watch build failed:', error);
    } else {
      console.log('watch build succeeded:', result);
      reloadScreen();
    }
  },
};
const watchedDirectories = [
  // './app/javascript/**/*.ts',
  // './app/javascript/**/*.js',
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
const colorWord = function(words, color) {
  const colorMap = {
    black: '\u001b[30m',
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    white: '\u001b[37m',
  };
  const reset = '\u001b[0m';
  return `${colorMap[color]}${words}${reset}`;
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
  watch: watch && watchOptions,
  // custom plugins will be inserted is this array
  plugins: [
    eslintPlugin({ persistLintIssues: true }),
  ],
};

let catchHandler = undefined;
if (watch) {
  catchHandler = () => console.log(`${colorWord('✘', 'red')} build failed`);
} else {
  catchHandler = () => process.exit(1);
}

esbuild.build(config).catch(catchHandler);

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

  chokidar.watch(watchedDirectories).on('all', (_event, changedFilePath) => {
    console.log(`${colorWord('⚡', 'green')} changed detected in file ${changedFilePath}`);
    reloadScreen();
  });
}
