---
title: Command Line Interface Guidelines 证据卡
created: 2026-05-02
author: clig.dev
year: 2025
source: "https://clig.dev/"
evidence-id: "evidence_0fdb5a5e605a432085d55fa6c59d323d"
trust-level: 4
retrieved: 2026-05-02
tags:
  - raw-source
  - cli
  - command-mode-tui
note-type: "[[raw-source]]"
links:
  - "[[command-mode-tui-preserves-cli-contracts]]"
  - "[[tui-ux-patterns-are-interaction-contracts]]"
---

# Command Line Interface Guidelines 证据卡

## 离线摘要
CLIG 是高质量 CLI UX 指南，强调命令行工具要尊重 stdout/stderr、exit code、管道、TTY 检测、无颜色输出、非交互环境和脚本化组合。它还明确其范围不包含 full-screen terminal programs，因此非常适合界定 command-mode TUI 与 persistent TUI 的边界。

## 可支撑的规范条款
- CLI command TUI 必须保留 stdout/stderr/exit code 契约。
- prompt 和动画只应在 TTY/交互场景出现，不能污染机器可读输出。
- TUI 是命令交互增强层，不应把功能只藏在 full-screen session 中。

## 连接
- [[command-mode-tui-preserves-cli-contracts]] — 命令模式 TUI 的主证据之一。
- [[tui-ux-patterns-are-interaction-contracts]] — 支撑 UX contract 的输出和可组合边界。

