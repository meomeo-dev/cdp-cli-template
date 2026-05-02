---
title: 命令模式 TUI 必须保留 CLI 契约
created: 2026-05-02
updated: 2026-05-02
aliases:
  - command-mode TUI
  - CLI command TUI
tags:
  - permanent-note
note-type: "[[permanent-note]]"
status: evergreen
maturity: evergreen
links:
  - "[[tui-ux-patterns-are-interaction-contracts]]"
  - "[[tui-design-systems-are-layered-constraints]]"
graph-label: Concept
graph-relations:
  - target: "[[tui-ux-patterns-are-interaction-contracts]]"
    relation: TO
    why: "命令模式 TUI 是 UX/UI 交互契约中的一个独立 profile"
  - target: "[[tui-design-systems-are-layered-constraints]]"
    relation: TO
    why: "它修正三层设计系统中的 UX/UI 层适用范围"
---

# 命令模式 TUI 必须保留 CLI 契约

## 主张
如果 TUI 是为 CLI command 交互设计，它应是 CLI 契约的渐进增强，而不是替代 CLI 的全屏应用。

## 论证
命令模式 TUI 从一次命令调用开始，以退出码结束。它必须保留 `args`、`flags`、`stdin`、`stdout`、`stderr`、exit code、TTY detection、JSON/structured output、`--yes`、`--non-interactive` 等 CLI 契约。交互界面只能帮助用户构造命令、选择参数、预览影响、确认危险操作、观察进度和恢复错误，不能成为唯一入口。非 TTY、CI、pipe 或 `--json` 场景下，prompt、spinner、全屏 alternate screen 都应关闭或降级。与 persistent/full-screen TUI 相比，命令模式 TUI 的核心不是 screen stack 和长期焦点状态，而是让一次命令更可理解、更安全、更可复现，同时不破坏脚本化和组合性。

## 连接
- [[tui-ux-patterns-are-interaction-contracts]] — 命令模式 TUI 是其中的 `command-interaction-profile`。
- [[tui-design-systems-are-layered-constraints]] — 三层设计系统应把 CLI contract 纳入 UX/UI 层。

