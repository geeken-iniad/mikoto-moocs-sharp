# Mikoto (MOOCs Sharp): MOOCsを便利に

[![Status: Experimental](https://img.shields.io/badge/status-experimental-red.svg)]()

[![GitHub Stars](https://img.shields.io/github/stars/geeken-iniad/mikoto-moocs-sharp?logo=github&style=flat)](https://github.com/geeken-iniad/mikoto-moocs-sharp/stargazers)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/geeken-iniad/mikoto-moocs-sharp/ci.yml?logo=github&link=https%3A%2F%2Fgithub.com%2Fgeeken-iniad%2Fmikoto-moocs-sharp%2Factions)](https://github.com/geeken-iniad/mikoto-moocs-sharp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fgeeken-iniad%2Fmikoto-moocs-sharp.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fgeeken-iniad%2Fmikoto-moocs-sharp?ref=badge_shield&issueType=license)

[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v19-blue?logo=react)](https://react.dev/)
[![WXT](https://img.shields.io/badge/WXT-gray?logo=wxt)](https://wxt.dev/)
[![vite-plugin-monkey](https://img.shields.io/badge/vite--plugin--monkey-gray)](https://github.com/lisonge/vite-plugin-monkey)

---

> [!WARNING]
> このプロジェクトはまだ不安定です。バグや予期しない動作が発生する可能性があります。
>
> このプロジェクトは公式のMOOCsプラットフォームとは無関係に開発されたサードパーティ製のツールです。使用にあたっては自己責任でお願いします。

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
