# How to New rails 7 with ESBuild and bootstrap

[ENGLISH](./README.md) | [日本語](./README.ja.md)

## Install ruby3.1.2 with rbenv

`rbenv install 3.1.2`

## Create application source folder

```shell
mkdir new_rails_7_with_esbuild
cd new_rails_7_with_esbuild
echo 3.1.2 > ./.ruby-version
ruby -v
```

## Install foreman

This is not required, Rails will install foreman automatically for us when run `bin/dev`.

`gem install foreman`

## Bundle init

```shell
bundle init
vim Gemfile
# enable rails gem
bundle install
```

## New rails

```shell
bundle exec rails new . \
--css bootstrap \
--javascript esbuild \
--database mysql \
--skip-test \
--force
```

## Create MySQL database

1. Adjust username/password/host settings in `config/database.yml`

   - username
   - password
   - host

2. Create database

    ```shell
    bundle exec rake db:create
    ```

3. Creating dummy models for test

    ```shell
    bundle exec rails  g scaffold Twitter title:string content:text
    bundle exec rake db:migrate
    ```

## Add [jQuery](https://yarnpkg.com/package/jquery)

Pleas skip this step, if you do not use jQuery in your project

1. `yarn add jquery`

1. `app/javascript/jquery`の配下に、下記のようにファイル群を構成しておく

    ```plaintext
    app/javascript
    ├── jquery
    │   ├── index.js
    │   └── publish_jquery.js
    ```

1. [`app/javascript/jquery/index.js`](./app/javascript/jquery/index.js)

    ```javascript
    import './publish_jquery';
    ```

1. [`app/javascript/jquery/publish_jquery.js`](./app/javascript/jquery/publish_jquery.js)

    ```javascript
    import jquery from 'jquery';
    window.jQuery = jquery;
    window.$ = jquery;
    ```

1. Add following code to [`app/javascript/application.js`](./app/javascript/application.js)

    ```javascript
    // jQuery
    import './jquery';
    ```

## Add [Bootstrap](https://yarnpkg.com/package/bootstrap)

No need to add it to package.json manually since it has already been added as a CSS framework in new rails.

1. Create folders as following

    ```plaintext
    app/javascript
    ├── bootstrap
    │   ├── enable_tooltip_everywhere.js
    │   ├── index.js
    │   └── publish_bootstrap.js
    ```

2. [`app/javascript/bootstrap/publish_bootstrap.js`](./app/javascript/bootstrap/publish_bootstrap.js)

    ```javascript
    import * as bootstrap from 'bootstrap';
    window.bootstrap = bootstrap;
    ```

3. [`app/javascript/bootstrap/enable_tooltip_everywhere.js`](./app/javascript/bootstrap/enable_tooltip_everywhere.js)

    ```javascript
    // https://getbootstrap.jp/docs/5.0/components/tooltips/#example-enable-tooltips-everywhere
    document.addEventListener('turbo:load', function() {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    });
    ```

4. [`app/javascript/bootstrap/index.js`](./app/javascript/bootstrap/index.js)

    ```javascript
    import './publish_bootstrap';

    import './enable_tooltip_everywhere';
    ```

5. Add following code to  `app/javascript/application.js`

    ```javascript
    // bootstrap
    import './bootstrap';
    ```

## Confirm sass whether work well

### Add fontawesome

Since we're at it, let's add [fontawesome](https://fontawesome.com/)

```shell
yarn add @fortawesome/fontawesome-free
```

### Adjust `app/javascript/application.js`

add following codes.

```javascript
// Font Awesome
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
```

### Prepare stylesheet folders as following

- app/assets/stylesheets/
  - component
    - module -> This folder is used to store common parts.
    - project -> This folder is used to store pars for each screens.

```shell
tree app/assets/stylesheets

app/assets/stylesheets
├── application.bootstrap.scss
└── module
    ├── component
    │   ├── _button.scss
    │   ├── _required_mark.scss
    │   └── _system_broadcast.scss
    └── project
        └── twitter.scss
```

Add these files to `app/assets/stylesheets/application.bootstrap.scss` as following.

```scss
@import "./module/component/button";
@import "./module/component/required_mark";
@import "./module/component/system_broadcast";
@import "./module/project/twitter";
```

Add some test html codes to `app/views/twitters/index.html.erb`.

Please check [here](./app/views/twitters/index.html.erb) for details.

## Typescript

We want to use Typescript to check Typescript conventions in ESBuild, so add it.

1. `yarn add -D typescript`

    ```shell
    app/javascript
    └── project
        ├── index.js
        └── twitter.ts
    ```

1. [`app/javascript/project/index.js`](./app/javascript/project/index.js)

    ```javascript
    import './twitter';
    ```

1. [`app/javascript/project/twitter.ts`](./app/javascript/project/twitter.ts)

    ```typescript
    function sayHello(name: string): void {
      console.log(`Hello, ${name}. Current datetime is ${new Date()}`);
    }

    document.addEventListener('turbo:load', function() {
      sayHello('TypeScript');
    });
    ```

1. [`app/javascript/application.js`](./app/javascript/application.js)

    ```javascript
    // js for each screens
    import './project';
    ```

## Setup ESLint

```shell
yarn add -D eslint esbuild-plugin-eslinter
yarn eslint --init
```

Adjust [`.eslintrc.json`](./.eslintrc.json) as following

```json
{
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "google"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "require-jsdoc": 0,
        "max-len": ["error", { "code": 120 }],
        // https://eslint.org/docs/latest/rules/object-curly-spacing#rule-details
        "object-curly-spacing": [
            "error", "always", {}
        ],
        // https://eslint.org/docs/latest/rules/indent
        "indent": [
            "error", 2, {
                "SwitchCase": 1
            }
        ]
    }
}
```

Add following helper script to [`package.json`](./package.json).

```json
"eslint": "eslint --ext .ts,.js ./app/javascript",
"eslint:fix": "eslint --fix --ext .ts,.js ./app/javascript"
```

Then we can use following command to check and fix Javascript code.

- `yarn eslint`
- `yarn eslint:fix`

## Setup StyleLint

1. Add plugins

    ```shell
    yarn add -D stylelint stylelint-config-standard \
    stylelint-config-prettier \
    stylelint-config-standard-scss \
    stylelint-config-recommended-scss \
    stylelint-config-recess-order \
    stylelint-config-recommended \
    stylelint-config-property-sort-order-smacss
    ```

1. Touch [`.stylelintrc.json`](./.stylelintrc.json)

    ```json
    {
      "extends": [
        "stylelint-config-standard",
        "stylelint-config-prettier",
        "stylelint-config-standard-scss",
        "stylelint-config-recess-order",
        "stylelint-config-recommended",
        "stylelint-config-recommended-scss",
        "stylelint-config-property-sort-order-smacss"
      ]
    }
    ```

1. Add following helper script to [`package.json`](./package.json)

    ```json
    "stylelint": "stylelint 'app/assets/stylesheets/**/*.{css,scss}'",
    "stylelint:fix": "stylelint --fix 'app/assets/stylesheets/**/*.{css,scss}'"
    ```

Then we can use following command to check css code and fix them.

- `yarn stylelint`
- `yarn stylelint:fix`

## Create a separate ESBuild config file

1. We may adjust the ESBuild configuration in the future, so create a separate [`esbuild.config.js`](./esbuild.config.js).

    ```javascript
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
    ```

2. Adjust `package.json` as following

    ```json
    "build:js": "node esbuild.config.js",
    ```

## Add Hot module reload feature

We will use a file change monitor plugin `chokidar` to do that.

1. Install `chokidar`

    `yarn add -D chokidar`

1. Create an ESBuild file for local development

    `touch ./esbuild-dev.config.js`

    You can also find this full file [here](./esbuild-dev.config.js)

    ```javascript
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
    ```

1. Add build script to [`package.json`](./package.json)

    ```json
    "build:js:dev": "node esbuild-dev.config.js",
    ```

1. Adjust Foreman configuration file ([`./Procfile.dev`](./Procfile.dev))

    ```plaintext
    web: bin/rails server -p 3000
    # js: yarn build:js --watch
    js: yarn build:js:dev --watch
    css: yarn build:css --watch
    ```

## DONE

The Rails 7 with ESBuild development environment construction is complete.
Just run `bin/dev` and you are ready to develop.
When there is any file changed, the screen will be automatically reloaded.

## What to do when you are developing

- Run `bin/dev`
- Don't forget to update the manifest when adding or removing Stimulus controllers
  - `bin/rails stimulus:manifest:update`
- Add import code to `index.js` or `index.scss` in the folder as appropriate when adding js/css files

## Will Do

- introduce a plugin that can import all JS files in a folder automatically
- introduce a plugin that can import CSS files in a folder automatically
- introduce a plugin that can import Stimulus controllers automatically

## Will NOT Do

- Not introduce a mechanism like Webpack that stops the application from working when a CSS/JS compile error occurs
  - Lint file is set up so that the editor will display warnings
  - CI checks for conventions.
  - It interferes with development
