# Mikoto (MOOCs Sharp): MOOCsを便利に

Mikotoは、MOOCsをより便利に利用するためのツールです。ブラウザ拡張機能版とUserscript版の複数のエディションを提供しています。

## 機能

[プロジェクトボード](https://github.com/orgs/iniad-mdx/projects/2)

- [x] ⚠️ 出席、課題があるタブを色付けして目立たせる
- [ ] 🕰️ 今・次の授業コマ情報の表示
- [ ] 📅 時間割の表示
- [x] ✨ デザインをより見やすく
- [x] 🃏 サイドバーのデック表示
- [x] 👆 講義カードをクリック可能に
- [ ] 🌙 テーマ切り替え (ダークテーマなど)
- [x] 🔢 文字数カウンター
- [x] ⌨️ Ctrl + Enterでフォーム提出
- [x] 🔁 数字キーでタブを切り替え

## エディション

### エディション比較表

| 項目 | Extension | Userscript Lite | Userscript |
|------|-----------|------------------|----------------|
| **機能** | ✅ 全機能 | ⚠️ 基本機能のみ | ✅ 全機能 |
| **前提条件** | なし | Tampermonkey等 | Tampermonkey等 |


## 開発

このプロジェクトはpnpmワークスペースを使用したモノレポ構成です。

### セットアップ

```sh
pnpm install
```

### プロジェクト構成

```
packages/
├── shared/            # 共通コンポーネント・ロジック
├── userscript-base/   # Userscriptの基盤
├── extension/         # ブラウザ拡張機能版 (WXT)
├── userscript-lite/   # Userscript Lite版 (vite-plugin-monkey)
└── userscript-pro/    # Userscript Pro版  (vite-plugin-monkey)
```

## License

This project is licensed under the [MIT License](LICENSE).

It also includes third-party software components, which are listed in the [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md) file.
