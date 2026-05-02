---
title: ECMA-48 控制函数标准证据卡
created: 2026-05-02
author: ECMA International
year: 1991
source: "https://ecma-international.org/publications-and-standards/standards/ecma-48/"
evidence-id: "evidence_5c7ba7f8ed9746baba4883a9c709cef0"
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

# ECMA-48 控制函数标准证据卡

## 离线摘要
ECMA-48 是字符编码数据中控制函数的标准来源，覆盖 7-bit 与 8-bit 控制函数。对 TUI 设计系统来说，它提供了控制序列、光标控制、擦除、样式等终端输出协议的标准底座。

## 可支撑的规范条款
- TUI 输出能力必须区分标准控制函数与终端私有扩展。
- 设计系统中的 `render`、`cursor`、`screen-control` token 不能被描述为视觉装饰，而应标明协议依赖。
- 若目标终端只声明基础控制函数，复杂鼠标、alternate screen、truecolor 等能力不能默认可用。

## 连接
- [[terminal-substrate-determines-tui-primitives]] — ECMA-48 是终端控制协议底座之一。

