---
title: Fuchsia CLI 指南证据卡
created: 2026-05-02
author: Google Fuchsia
year: 2025
source: "https://fuchsia.dev/fuchsia-src/development/api/cli"
evidence-id: "evidence_11b2df9948eb409f9d91d36290bd58bd"
trust-level: 5
retrieved: 2026-05-02
tags:
  - raw-source
  - cli
  - command-mode-tui
note-type: "[[raw-source]]"
links:
  - "[[command-mode-tui-preserves-cli-contracts]]"
---

# Fuchsia CLI 指南证据卡

## 离线摘要
Fuchsia CLI 指南区分用户交互与程序化交互，要求工具能明确进入交互或非交互模式，避免意外 prompt，正确使用 stdout/stderr，并用退出码表达结果。

## 可支撑的规范条款
- 交互模式必须显式或可预测，不能突然阻塞脚本。
- command-mode TUI 需要 `--non-interactive`、`--yes` 或等价绕过路径。
- stdout 输出结果，stderr 输出诊断/进度，这应写进规范。

## 连接
- [[command-mode-tui-preserves-cli-contracts]] — 支撑 CLI contract first 的设计原则。

