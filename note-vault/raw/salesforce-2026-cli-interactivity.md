---
title: Salesforce CLI 交互与 JSON 输出证据卡
created: 2026-05-02
author: Salesforce
year: 2026
source: "https://developer.salesforce.com/docs/platform/salesforce-cli-plugin/guide/interactivity.html"
evidence-id: "evidence_5b5e9424032944d2bafb69ccd476a0e7"
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

# Salesforce CLI 交互与 JSON 输出证据卡

## 离线摘要
Salesforce CLI 文档说明 prompt 可以改善体验，但在 JSON 输出或脚本化场景中必须保持 stdout 可解析，并通过 flags 提供 prompt 输入的非交互替代。

## 可支撑的规范条款
- `--json` 或机器可读输出模式必须关闭交互 prompt 和装饰性输出。
- 每个 prompt 字段都要有 flag、配置、环境变量或 stdin 替代。
- command-mode TUI 的交互层不能破坏自动化输出契约。

## 连接
- [[command-mode-tui-preserves-cli-contracts]] — 支撑 JSON/scriptable mode 与 prompt suppression。

