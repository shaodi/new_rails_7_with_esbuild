# New rails 7 with esbuild

## ruby3.1.2のインストール

`rbenv install 3.1.2`

## アプリ用のフォルダの作成

```shell
mkdir new_rails_7_with_esbuild
cd new_rails_7_with_esbuild
echo 3.1.2 > ./.ruby-version
ruby -v
```

## foremanのインストール
必須ではなく、`bin/dev`叩くときに、Railsは自動的にインストールしてくれる。

`gem instlal foreman`

## bundle init

```shell
bundle init
vim Gemfile
# rails gemを有効にする
bundle install
```

## new rails

```shell
bundle exec rails new . \
--css bootstrap \
--javascript esbuild \
--database mysql \
--skip-test \
--force
```

## Database作成

### 適宜に`config/database.yml`ファイルを調整し、DBに接続できるようにしておく

- username
- password
- host

### DB作成

```shell
bundle exec rake db:create
```

### 検証用のダミーモデルの作成

```shell
bundle exec rails  g scaffold Twitter title:string content:text
bundle exec rake db:migrate
```

## jquery入れる

`yarn add jquery`

`app/javascript/jquery`の配下に、下記のようにファイル群を構成しておく

```shell
app/javascript
├── jquery
│   ├── index.js
│   └── publish_jquery.js
```

### `app/javascript/index.js`

```javascript
import './publish_jquery';
```

### `app/javascript/publish_jquery.js`

```javascript
import jquery from 'jquery';
window.jQuery = jquery;
window.$ = jquery;
```

### `app/javascript/application.js`に、いれておく

```javascript
// jQuery
import './jquery';
```

## bootstrap入れる

new railsの際に、すでにCSSフレームワークとして指定しているため、追加不要。

```shell
app/javascript
├── bootstrap
│   ├── enable_tooltip_everywhere.js
│   ├── index.js
│   └── publish_bootstrap.js
```

### `app/javascript/bootstrap/publish_bootstrap.js`

```javascript
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;
```

### `app/javascript/bootstrap/enable_tooltip_everywhere.js`

```javascript
// https://getbootstrap.jp/docs/5.0/components/tooltips/#example-enable-tooltips-everywhere
document.addEventListener('turbo:load', function() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
```

### `app/javascript/bootstrap/index.js`

```javascript
import './publish_bootstrap';

import './enable_tooltip_everywhere';
```

### `app/javascript/application.js`に追加しておく

```javascript
// bootstrap
import './bootstrap';
```

## sass確認

### Fontawesome追加

せっかくなので、[fontawesome](https://fontawesome.com/) もいれましょう

```shell
yarn add @fortawesome/fontawesome-free
```

### app/javascript/application.js 調整

下記を追加

```javascript
// Font Awesome
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
```

### stylesheetフォルダを構成

**下記のような構成にしておく**

- app/assets/stylesheets/
  - component
    - module 共通部品
    - project 画面特有のもの

**今回テストするために、下記のテストファイルを作成します**

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

**追加したファイルを、`app/assets/stylesheets/application.bootstrap.scss`に追加しておく**

```scss
@import "./module/component/button";
@import "./module/component/required_mark";
@import "./module/component/system_broadcast";
@import "./module/project/twitter";
```

`app/views/twitters/index.html.erb`を開いて、適宜にテストコードを入れる

詳細は、[ここ](./app/views/twitters/index.html.erb)。

## Typescript

ESLint中でTypescriptの規約チェックをするため、追加しておく。

`yarn add -D typescript`

```shell
app/javascript
└── project
    ├── index.js
    └── twitter.ts
```

### `app/javascript/project/index.js`

```javascript
import './twitter';
```

### `app/javascript/project/twitter.ts`

```typescript
function sayHello(name: string): void {
  console.log(`Hello, ${name}. Current datetime is ${new Date()}`);
}

document.addEventListener('turbo:load', function() {
  sayHello('TypeScript');
});
```

### `app/javascript/application.js`

```javascript
// js for each screens
import './project';
```

## ESLint設定

```shell
yarn add -D eslint esbuild-plugin-eslinter
yarn eslint --init
```

出来上がった`eslintrc.json`ファイルを調整

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

eslintスクリプトを、`package.json`に追加

```json
    "eslint": "eslint --ext .ts,.js ./app/javascript",
    "eslint:fix": "eslint --fix --ext .ts,.js ./app/javascript"
```

これで、下記のコマンドは使えるようになる
- `yarn eslint`
- `yarn eslint:fix`

## StyleLintの設定

1. プラグインの追加

```shell
yarn add -D stylelint stylelint-config-standard \
stylelint-config-prettier \
stylelint-config-standard-scss \
stylelint-config-recommended-scss \
stylelint-config-recess-order \
stylelint-config-recommended \
stylelint-config-property-sort-order-smacss
```

1. touch `.stylelintrc.json`

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

1. ヘルパースクリプトを`package.json`に追加

```json
    "stylelint": "stylelint 'app/assets/stylesheets/**/*.{css,scss}'",
    "stylelint:fix": "stylelint --fix 'app/assets/stylesheets/**/*.{css,scss}'"
```

## Hot module reload機能の追加

`chokidar`を用いて構築する

1. `chokidar`のインストール

    `yarn add -D chokidar`

1. ローカル用のesbuildファイルの作成

    `touch ./esbuild-dev.config.js`

    You can also find this file [here](./esbuild-dev.config.js)

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
    const watchedDirectories = [
      './app/javascript/**/*.ts',
      './app/javascript/**/*.js',
      './app/views/**/*.html.erb',
      './app/views/**/*.html.slim',
      './app/assets/builds/*.css',
    ];
    const bannerJs = watch ?
      ' (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();' : '';

    const config = {
      entryPoints: ['application.js'],
      bundle: true,
      sourcemap: true,
      outdir: path.join(process.cwd(), 'app/assets/builds'),
      incremental: true,
      absWorkingDir: path.join(process.cwd(), 'app/javascript'),
      banner: { js: bannerJs },
      watch: true,
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
            result.rebuild();
          }
          clients.forEach((res) => res.write('data: update\n\n'));
          clients.length = 0;
        });
      })();
    } else {
      esbuild.build(config).catch(() => process.exit(1));
    }
    ```

1. ローカルビルド用のヘルパースクリプトを`package.json`に追加

    ```json
    "build:js:dev": "node esbuild-dev.config.js",
    ```

1. Foreman設定ファイル([`./Procfile.dev`](./Procfile.dev))を調整

    ```json
    web: bin/rails server -p 3000
    # js: yarn build:js --watch
    js: yarn build:js:dev --watch
    css: yarn build:css --watch
    ```

## DONE

これで構築は完了。
`bin/dev`を起動すれば、開発できるようになります。
ファイル変更があった際に、画面のリロードも自動的に行われる。

## その他

- `bin/dev`起動
- Stimulusコントローラー追加や削除の際に、マニフェストの更新を忘れず
  - `bin/rails stimulus:manifest:update`
- js/cssファイル追加の際に、適宜にフォルダにある `index.js`や`index.scss`にインポート文を追加

## TODO

- フォルダ中のJSフィアルをまとめてインポートできるプラグインを導入
- フォルダ中のCSSフィアルをまとめてインポートできるプラグインを導入
- Stimulus controllerをまとめてインポートできるプラグインを導入

## NOT DO

- Webpackのような、CSS/JSコンパイル時エラーが発生したときのアプリケーションが動かなくなる仕組みを導入しない
  - Lintファイル設定したため、エディターが警告を表示してくれる
  - CIで規約チェックしている
  - 開発に邪魔になる

