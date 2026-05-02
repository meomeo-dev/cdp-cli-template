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
