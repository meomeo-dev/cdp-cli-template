---
title: WCAG 色彩与动态约束证据卡
created: 2026-05-02
author: W3C WAI
year: 2023
source: "https://www.w3.org/WAI/WCAG22/"
evidence-id: "evidence_61bc189da47e4282b474162c42c9d6ba"
trust-level: 5
retrieved: 2026-05-02
tags:
  - raw-source
  - accessibility
  - design-tokens
note-type: "[[raw-source]]"
links:
  - "[[tui-aesthetics-are-tokenized-constraints]]"
  - "[[tui-ux-patterns-are-interaction-contracts]]"
---

# WCAG 色彩与动态约束证据卡

## 离线摘要
WCAG 2.2 的 Use of Color、Contrast Minimum、Focus Appearance、Pause Stop Hide 等条款共同约束颜色、对比、焦点和动态内容。对 TUI 来说，这些条款要求颜色不能是唯一语义，焦点必须可辨认，持续运动/闪烁要能停止或降级。

## 可支撑的规范条款
- status、error、selection、focus 不能只靠颜色表达。
- spinner、blink、scrolling text 必须有静态文本 fallback。
- 实际终端主题不可控，因此规范需要 no-color 和 high-contrast profile。

## 连接
- [[tui-aesthetics-are-tokenized-constraints]] — 支撑 color/motion/focus token 的可访问性约束。
- [[tui-ux-patterns-are-interaction-contracts]] — 支撑状态文本冗余与键盘可达。

