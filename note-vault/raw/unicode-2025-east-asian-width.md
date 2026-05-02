---
title: Unicode East Asian Width 证据卡
created: 2026-05-02
author: Unicode Consortium
year: 2025
source: "https://www.unicode.org/reports/tr11/"
evidence-id: "evidence_16a67acd16a447dfa051900d16df5af4"
trust-level: 5
retrieved: 2026-05-02
tags:
  - raw-source
  - tui
  - unicode
note-type: "[[raw-source]]"
links:
  - "[[terminal-substrate-determines-tui-primitives]]"
---

# Unicode East Asian Width 证据卡

## 离线摘要
Unicode UAX #11 定义 East_Asian_Width 属性，用于固定宽度文本处理中判断字符宽度。但该属性本身也提醒：现代终端实际显示宽度可能受上下文、字体和实现影响。

## 可支撑的规范条款
- TUI 布局不能用字节数或字符数代替 display width。
- 表格、截断、对齐、边框和高亮需要 display-width 策略。
- ambiguous width 必须作为国际化风险处理，而不是假设全局一致。

## 连接
- [[terminal-substrate-determines-tui-primitives]] — Unicode 宽度是字符网格布局的关键风险。

