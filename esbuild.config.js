#!/usr/bin/env node

const path = require('path');

// "build": "esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets",
require('esbuild').build({
  entryPoints: ['application.js'],
  bundle: true,
  sourcemap: true,
  outdir: path.join(process.cwd(), 'app/assets/builds'),
  absWorkingDir: path.join(process.cwd(), 'app/javascript'),
  watch: true,
  // custom plugins will be inserted is this array
  plugins: [],
}).catch(() => process.exit(1));

