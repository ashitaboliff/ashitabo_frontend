## API クライアント生成 (Orval)

バックエンドのOpenAPI (http://localhost:8787/openapi.json) からクライアントを生成します。

```txt
npm run orval
```

生成先: `src/lib/api`

ドキュメントは[こちら](https://docs.ashitabo.net)

## はじめかた

Docker Desktop と WSL2 をインストールしてからUbuntu上の/home/[user]配下にリポジトリをクローン。

シェルで/home/[user]/k_on_lineに移動して以下を実行。

```bash
make new
make up
```

[http://localhost:3000](http://localhost:3000) を開けば結果が見れるよ。
