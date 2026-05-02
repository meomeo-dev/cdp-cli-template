---
title: Rich Console API 证据卡
created: 2026-05-02
author: Textualize
year: 2025
source: "https://rich.readthedocs.io/en/latest/console.html"
evidence-id: "evidence_7a7cb99fbc6544eaa8be9fcff230f51f"
trust-level: 4
retrieved: 2026-05-02
tags:
  - raw-source
  - tui
  - terminal
note-type: "[[raw-source]]"
links:
  - "[[tui-aesthetics-are-tokenized-constraints]]"
  - "[[command-mode-tui-preserves-cli-contracts]]"
---

# Rich Console API 证据卡

## 离线摘要
Rich Console API 体现现代终端输出库如何处理 color system、no-color、truecolor、Windows、非终端输出、overflow/cropping、status spinner 和 alternate screen。这是把设计系统 token 映射到真实终端能力的实现层证据。

## 可支撑的规范条款
- 输出库应检测终端能力，并提供 no-color/plain fallback。
- status/spinner 属于 TTY 增强，不能污染机器可读输出。
- overflow、crop、wrap 是命令输出规范的一部分。

## 连接
- [[tui-aesthetics-are-tokenized-constraints]] — 支撑能力映射与 fallback。
- [[command-mode-tui-preserves-cli-contracts]] — 支撑 TTY-only progress 和 plain output。

