---
title: Deep Research TUI 原文归档索引
created: 2026-05-02
author: deep-research
year: 2026
source: "local deep-research evidence_archive artifacts"
research-id: "research_d20a7e0ec2774bfd8904fd1736c72d1b"
tags:
  - raw-source
  - web-archive
  - research-audit
note-type: "[[raw-source]]"
links:
  - "[[tui-design-system-moc]]"
  - "[[raw/clig-2025-command-line-guidelines]]"
  - "[[raw/ecma-1991-control-functions]]"
  - "[[raw/xterm-2025-control-sequences]]"
  - "[[raw/ncurses-2026-terminfo]]"
  - "[[raw/unicode-2025-east-asian-width]]"
  - "[[raw/ratatui-2026-terminal-abstraction]]"
  - "[[raw/fuchsia-2025-cli-guidance]]"
  - "[[raw/salesforce-2026-cli-interactivity]]"
  - "[[raw/heroku-2025-cli-style-guide]]"
  - "[[raw/patternfly-2025-cli-handbook]]"
  - "[[raw/w3c-2026-aria-keyboard]]"
  - "[[raw/rich-2025-console-api]]"
  - "[[raw/w3c-2025-design-tokens]]"
  - "[[raw/w3c-2023-wcag-color-motion]]"
---

# Deep Research TUI 原文归档索引

## 用途
这是 TUI 设计系统研究的本地原文归档清单。原网页全文没有平铺复制到每张 raw 卡片里，而是通过 `deep-research evidence_archive` 存入 `.deep-research/deep-research.sqlite` 的 `web_archive` artifact；各 raw 卡片保存短摘录、释义、DAG 入口和全文查看命令。

## 连接
- [[tui-design-system-moc]] — 本索引服务于 TUI 设计系统研究地图。
- [[raw/clig-2025-command-line-guidelines]]、[[raw/fuchsia-2025-cli-guidance]]、[[raw/salesforce-2026-cli-interactivity]]、[[raw/heroku-2025-cli-style-guide]]、[[raw/patternfly-2025-cli-handbook]] — 命令模式 TUI 与 CLI 契约证据。
- [[raw/ecma-1991-control-functions]]、[[raw/xterm-2025-control-sequences]]、[[raw/ncurses-2026-terminfo]]、[[raw/unicode-2025-east-asian-width]]、[[raw/ratatui-2026-terminal-abstraction]] — 终端媒介与渲染机制证据。
- [[raw/w3c-2026-aria-keyboard]]、[[raw/rich-2025-console-api]]、[[raw/w3c-2025-design-tokens]]、[[raw/w3c-2023-wcag-color-motion]] — UX、可访问性与设计 token 证据。

## 统一查看命令
```bash
deep-research artifact_list --project . \
  --research-id research_d20a7e0ec2774bfd8904fd1736c72d1b \
  --format json \
  | jq -r '.data[] | select(.artifactKind=="web_archive") | [.id, .evidenceId, .title] | @tsv'
```

查看单个全文时，把 `<artifact-id>` 替换为下表中的 artifact：

```bash
deep-research artifact_list --project . \
  --research-id research_d20a7e0ec2774bfd8904fd1736c72d1b \
  --format json \
  | jq -r '.data[] | select(.id=="<artifact-id>") | .body'
```

## 归档清单
| Raw 卡片 | Archive Evidence | Web Archive Artifact | Backend | Chars | DAG 支撑节点 |
|---|---|---|---|---:|---|
| [[raw/clig-2025-command-line-guidelines]] | `evidence_90c49bc877e64efc905c08cd746a5848` | `artifact_6e867270be69477b9ebe24fa103bf23d` | node | 64,912 | `node_72e52d90b8ac4248bd74ffd8329646f2` |
| [[raw/ecma-1991-control-functions]] | `evidence_c35b8caba26148d3b8bfa78753ec308a` | `artifact_10796643df2f43cdadea5d2b7d96497a` | node | 4,123 | `node_b8590c2f02c045799b8ee813cb1f32f8` |
| [[raw/xterm-2025-control-sequences]] | `evidence_60a92d49fcd34111be9f4875e75b5623` | `artifact_9a554c5db35a4a89a8fd9cf927bdf1f1` | node | 138,966 | `node_b8590c2f02c045799b8ee813cb1f32f8` |
| [[raw/ncurses-2026-terminfo]] | `evidence_dec2865125744c478314cdf8058d2570` | `artifact_5c6e8c52d6ec429ea7ca9a5eebaabebb` | node | 98,449 | `node_b8590c2f02c045799b8ee813cb1f32f8` |
| [[raw/unicode-2025-east-asian-width]] | `evidence_2254291258c142fd93dc9438517a4bb7` | `artifact_cd2fa8e999c841fb956f2cd73a742110` | node | 28,474 | `node_b8590c2f02c045799b8ee813cb1f32f8` |
| [[raw/ratatui-2026-terminal-abstraction]] | `evidence_5def0d2bf3df493d8b5ea886be37b0ca` | `artifact_c42d6a74b43a476e92d6148e147055b2` | node | 24,632 | `node_b8590c2f02c045799b8ee813cb1f32f8` |
| [[raw/fuchsia-2025-cli-guidance]] | `evidence_88a8513fad914c20b3d21026dea43c55` | `artifact_a752ccf3430b42ac842eee90d0e47802` | node | 48,262 | `node_72e52d90b8ac4248bd74ffd8329646f2` |
| [[raw/salesforce-2026-cli-interactivity]] | `evidence_8c4e75bb9764479bae1367fcc65b4ffc` | `artifact_9a359224426542639cc503de4bdcd03c` | crawl4ai | 1,615 | `node_72e52d90b8ac4248bd74ffd8329646f2` |
| [[raw/heroku-2025-cli-style-guide]] | `evidence_2ee7a7a90818401abe6d0db3893fde4c` | `artifact_493d28ec298f4a9fbdbb8d3c292ac217` | node | 16,102 | `node_72e52d90b8ac4248bd74ffd8329646f2` |
| [[raw/patternfly-2025-cli-handbook]] | `evidence_c63a2e241e274532b81ad371822a2e1f` | `artifact_33f97614f83a43ad98ccc23a412add3e` | node | 9,950 | `node_d8b21f20c21a4a3384cb44835c3e1917` |
| [[raw/w3c-2026-aria-keyboard]] | `evidence_bf1f7b283e00495282a9943e6657b4bc` | `artifact_f7f3966d5f314540ab731bdbdafbebd3` | node | 35,593 | `node_d8b21f20c21a4a3384cb44835c3e1917` |
| [[raw/rich-2025-console-api]] | `evidence_83f8e2e4e73842a49c418556470e080f` | `artifact_c481c3ffad5e437f985d9b42c0f610a3` | node | 19,815 | `node_ed9ca338c90e41e1a9403ed39721b509` |
| [[raw/w3c-2025-design-tokens]] | `evidence_ac6a93e4855a4fa7bc3994b2aac6073f` | `artifact_93231eb892f64ac4b2e36d944f7909cb` | node | 84,656 | `node_ed9ca338c90e41e1a9403ed39721b509` |
| [[raw/w3c-2023-wcag-color-motion]] | `evidence_468d7adc2af642988929528a42837530` | `artifact_344c2da7e3f54bf89f448c3cd8a8ef81` | node | 155,349 | `node_ed9ca338c90e41e1a9403ed39721b509` |

## 降级记录
- `evidence_e4cc41fe466947faa6462f2453683d18` 是 Salesforce 页面用 `node` backend 归档时返回 403 的降级记录；已改用 `crawl4ai` 成功归档为 `evidence_8c4e75bb9764479bae1367fcc65b4ffc`。降级记录在 DAG 中只以 `annotates` 记录归档失败，不作为 `supports` 支撑边。
