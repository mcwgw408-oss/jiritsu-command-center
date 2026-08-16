# データ構造

保存先はブラウザのlocalStorageです。

キー:

```text
jiritsu-command-center-v1
```

## 全体

```ts
type AppData = {
  version: 1
  settings: {
    dashboardUrl: string
  }
  items: CommandItem[]
}
```

## 項目

```ts
type CommandItem = {
  id: string
  section:
    | 'current'
    | 'assets'
    | 'sources'
    | 'seeds'
    | 'experiments'
    | 'learnings'
  title: string
  body: string
  tags: string[]
  links: string[]
  status?: string
  startDate?: string
  reviewCue?: string
  updatedAt: string
}
```

`status`、`startDate`、`reviewCue` は「実験中」で主に使います。

`reviewCue` は日付に限定しません。

例:

- モニター3人の感想が集まったら
- 記事を5本出したら
- 一度実演したら
