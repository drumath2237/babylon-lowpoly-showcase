# Babylon Low-poly Showcase

[![github pages](https://github.com/drumath2237/babylon-lowpoly-showcase/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/drumath2237/babylon-lowpoly-showcase/actions/workflows/gh-pages.yml)

## about

Blenderで作ったモデルをBabylonで美しくレンダリングすることを目指したプロジェクトです。Low-polyというのはたまたまモデルがローポリだっただけであまり意味はありません。

## install

Use this templateによってGithubリポジトリを作り、それをクローンしたディレクトリで`yarn`します。

## usage

フォルダ構成としては、`/src/index.ts`をエントリポイントにして`/dist/bundle.js`がビルドされます。
htmlは`dist/index.html`がそのまま使われます。

`yarn build`でwebpackのビルドが走り、dist以下にbundle.jsがビルドされます。

`yarn start`でwebpack-dev-serverが起動し、ローカルホストの8080ポートでdist以下をホストします。

この時、GitHub Pagesの仕様上の問題で、`canvasManager.ts`の中のモデルのルートパスを`/scenes/`に変更しないとlocalで動かないです。(直さなきゃ)

masterブランチにpushすると、GitHub Actionsによって`gh-pages`ブランチにdist以下がpushされ、GitHubPagesがデプロイされるようになっています。

## Contact

何か問題等ございましたら、[こちらのTwitter](https://twitter.com/ninisan_drumath)までよろしくお願いいたします。