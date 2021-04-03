# TypeScript Sandbox Template

[![github pages](https://github.com/drumath2237/babylon-lowpoly-showcase/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/drumath2237/babylon-lowpoly-showcase/actions/workflows/gh-pages.yml)

## about

すごく簡単なWebフロントアプリだったりdemoだったりをTypeScript使って作りたいときのためのテンプレート。
ペライチのWebページでもTypeScriptが絡むと途端に環境構築がめんどくさくて過去の資料漁ってたりしたので、それを防ぐために作りました。
自分の場合は簡単なライブラリとか試すときにノンフレームワークのts使うときがあるので、そういう用途を想定しています。色々使えるように最小構成にしていますので、本番用には向いていません。

## install

Use this templateによってGithubリポジトリを作り、それをクローンしたディレクトリで`yarn`します。

## usage

フォルダ構成としては、`/src/index.ts`をエントリポイントにして`/dist/src/bundle.js`がビルドされます。
htmlは`dist/index.html`がそのまま使われます。

`yarn build`でwebpackのビルドが走り、dist以下にbundle.jsがビルドされます。

`yarn start`でwebpack-dev-serverが起動し、ローカルホストの8080ポートでdist以下をホストします。

masterブランチにpushすると、GitHub Actionsによって`gh-pages`ブランチにdist以下がpushされ、GitHubPagesがデプロイされるようになっています。

## Contact

何か問題等ございましたら、[こちらのTwitter](https://twitter.com/ninisan_drumath)までよろしくお願いいたします。