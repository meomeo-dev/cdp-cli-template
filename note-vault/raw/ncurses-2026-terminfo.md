---
title: ncurses terminfo 能力数据库证据卡
created: 2026-05-02
author: ncurses
year: 2026
source: "https://invisible-island.net/ncurses/man/terminfo.5.html"
evidence-id: "evidence_87c7b1aa72ee453596252b9e4a4c0073"
trust-level: 5
retrieved: 2026-05-02
tags:
  - raw-source
  - tui
  - terminal
note-type: "[[raw-source]]"
links:
  - "[[terminal-substrate-determines-tui-primitives]]"
---

# ncurses terminfo 能力数据库证据卡

## 离线摘要
terminfo 用 boolean、numeric、string capabilities 描述终端能力和操作序列，是程序查询终端能力而不是硬编码控制序列的重要机制。

## 可支撑的规范条款
- TUI 设计系统必须有能力查询与 fallback 层，不能假设所有终端支持同一组控制序列。
- 组件规范应标注最低能力要求和降级行为。
- `$TERM` 与能力数据库是运行时适配的一部分，不是实现细节。

## 连接
- [[terminal-substrate-determines-tui-primitives]] — terminfo 支撑 capability token 和 fallback 设计。

