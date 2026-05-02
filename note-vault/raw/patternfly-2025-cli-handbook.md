---
title: PatternFly CLI Handbook 证据卡
created: 2026-05-02
author: PatternFly
year: 2025
source: "https://www.patternfly.org/developer-resources/cli-handbook/"
evidence-id: "evidence_fcbd4f7d737c442897dce53a8aa1efa1"
trust-level: 5
retrieved: 2026-05-02
tags:
  - raw-source
  - cli
  - accessibility
note-type: "[[raw-source]]"
links:
  - "[[tui-ux-patterns-are-interaction-contracts]]"
  - "[[command-mode-tui-preserves-cli-contracts]]"
---

# PatternFly CLI Handbook 证据卡

## 离线摘要
PatternFly CLI Handbook 从设计系统角度整理 CLI 命令结构、文本、反馈、可访问性、非交互模式、结构化输出和颜色使用。它强调不要只用颜色传递信息，prompt 和反馈要清晰，交互模式不能阻断自动化。

## 可支撑的规范条款
- CLI/TUI 的状态必须有文本冗余，不能仅依赖颜色或符号。
- 交互模式适合 setup、配置、选择等场景，不适合 CI 和重复任务。
- 规范应包含 `--guided`、`--non-interactive`、`--yes` 等模式边界。

## 连接
- [[tui-ux-patterns-are-interaction-contracts]] — 支撑交互发现、反馈和可访问性。
- [[command-mode-tui-preserves-cli-contracts]] — 支撑 command-interaction-profile。

