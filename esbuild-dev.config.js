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
      // console.error('watch build failed:', error);
      reloadScreen(inspectESBuildError(error));
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
// (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();
const onMessage = `
(
  // () => new EventSource("http://localhost:8082").onmessage = () => location.reload()
  function() {
    return new EventSource("http://localhost:8082").onmessage = function(e) {
      if (e.data == 'update') {
        location.reload();
      }
      else {
        let div = document.createElement('div');
        div.style.backgroundColor = 'black';
        div.style.opacity = '.8';
        div.style.color = 'white';
        div.style.position = 'absolute';
        div.style.left = '0';
        div.style.top = '0';
        div.style.width = '100%';
        div.style.padding = '20px';
        div.append(e.data);
        document.body.appendChild(div);
      }
    };
  }
)();
`;
const inspectESBuildError = function(_error) {
  // TODO: need to inspect error/warnings to client
  return 'rebuild failed, please check console';
};
const bannerJs = watch ? onMessage : '';
const reloadScreen = function(error) {
  const data = (error ?? 'update');
  clients.forEach((res) => res.write(`data: ${data}\n\n`));
  if (data == 'update') clients.length = 0;
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

esbuild
  .build(config)
  .then((_result) => {
    if (watch) {
      console.log(`${colorWord('👀', 'green')} Build finished, watching for changes...`);
    } else {
      console.log(`${colorWord('🍺', 'green')} Build finished, Congrats`);
    }
  })
  .catch(catchHandler);

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
