---
title: Log
created: 2026-05-02
tags:
  - system
  - log
---

# Log

## [2026-05-02] init | Vault 初始化
- 新建了: index.md, log.md, daily/, raw/, templates/, slides/, assets/
- Daily: [[daily/2026-05-02]]
- 模板: daily.TEMPLATE.md, literature.TEMPLATE.md, permanent.TEMPLATE.md, moc.TEMPLATE.md
- lint: obsidian-md-lint 0 issue, vault-naming-lint 0 issue

## [2026-05-02] research | TUI 设计系统
- deep-research: `research_d20a7e0ec2774bfd8904fd1736c72d1b`
- raw: [[raw/deepseek-2026-tui-basic-source-map]], [[raw/deepseek-2026-tui-ux-source-map]], [[raw/deepseek-2026-tui-aesthetic-source-map]]
- 新建了: [[tui-design-system-moc]], [[tui-design-systems-are-layered-constraints]], [[terminal-substrate-determines-tui-primitives]], [[tui-ux-patterns-are-interaction-contracts]], [[tui-aesthetics-are-tokenized-constraints]]
- 审计: 基本原理、UX/UI、设计美学均通过

## [2026-05-02] research | 命令模式 TUI 差异
- deep-research: `research_d20a7e0ec2774bfd8904fd1736c72d1b`
- 新建了: [[command-mode-tui-preserves-cli-contracts]]
- 更新了: [[tui-ux-patterns-are-interaction-contracts]], [[tui-design-system-moc]], [[index]]
- 结论: CLI command TUI 应默认采用 `command-interaction-profile`，保留 args/flags/stdin/stdout/stderr/exit code 和非交互路径。

## [2026-05-02] evidence | TUI 关键证据离线卡
- 新建 raw: [[raw/ecma-1991-control-functions]], [[raw/xterm-2025-control-sequences]], [[raw/ncurses-2026-terminfo]], [[raw/unicode-2025-east-asian-width]], [[raw/ratatui-2026-terminal-abstraction]]
- 新建 raw: [[raw/clig-2025-command-line-guidelines]], [[raw/fuchsia-2025-cli-guidance]], [[raw/salesforce-2026-cli-interactivity]], [[raw/heroku-2025-cli-style-guide]], [[raw/patternfly-2025-cli-handbook]]
- 新建 raw: [[raw/w3c-2026-aria-keyboard]], [[raw/w3c-2025-design-tokens]], [[raw/w3c-2023-wcag-color-motion]], [[raw/rich-2025-console-api]]
- 更新了: [[tui-design-system-moc]], [[terminal-substrate-determines-tui-primitives]], [[tui-ux-patterns-are-interaction-contracts]], [[command-mode-tui-preserves-cli-contracts]], [[tui-aesthetics-are-tokenized-constraints]]

## [2026-05-02] evidence | deep-research 原文归档
- 使用 `deep-research evidence_archive` 为 14 个关键来源生成 `web_archive` 原文工件，并链接进 DAG 支撑节点。
- 新建 raw: [[raw/deep-research-2026-tui-web-archive-index]]
- 更新 raw: 为每张证据卡补充 `archive-evidence-id`、`archive-artifact-id`、DAG 支撑边和全文查看命令。
- 备注: Salesforce 页面 `node` backend 403，已改用 `crawl4ai` 成功归档；降级记录只作为 `annotates` 审计边，不作为支撑边。
