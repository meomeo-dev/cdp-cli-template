---
title: 终端媒介限制决定 TUI 基础原语
created: 2026-05-02
updated: 2026-05-02
aliases:
  - 终端媒介限制
  - terminal substrate
tags:
  - permanent-note
note-type: "[[permanent-note]]"
status: evergreen
maturity: evergreen
links:
  - "[[tui-design-systems-are-layered-constraints]]"
  - "[[tui-ux-patterns-are-interaction-contracts]]"
graph-label: Concept
graph-relations:
  - target: "[[tui-design-systems-are-layered-constraints]]"
    relation: TO
    why: "这是 TUI 分层设计系统的第一层"
  - target: "[[tui-ux-patterns-are-interaction-contracts]]"
    relation: TO
    why: "UX/UI contract 必须继承终端能力与 fallback 约束"
---

# 终端媒介限制决定 TUI 基础原语

## 主张
TUI 的基础 token 应首先来自终端媒介限制，而不是来自 GUI 组件分类。

## 论证
终端 UI 的布局单位是字符 cell，窗口大小是运行时行列状态，输出依赖 ECMA-48、DEC/xterm 和平台 VT 扩展，输入可能处于 canonical、noncanonical 或 raw mode。终端能力还受 `$TERM`、terminfo、Windows VT flags、颜色深度、Unicode display width、alternate screen 和宿主可访问性能力影响。设计系统若跳过这些限制，组件看似成立，却无法在无颜色、无鼠标、小视口、宽字符、低能力终端或异常退出时保持一致。TUI 基础原语因此应包含 `cell`、`capability`、`input`、`render` 和 `fallback`，并为每种能力定义降级路径。

## 连接
- [[tui-design-systems-are-layered-constraints]] — 本文是三层约束栈的底座。
- [[tui-ux-patterns-are-interaction-contracts]] — UX/UI 模式必须以这些基础原语为前提。
