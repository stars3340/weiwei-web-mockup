# 喂喂 Web Demo

对外演示用的 Web 版本：用一个固定的手机壳容器模拟 iOS 交互流程，并尽量对齐 iOS 原生实现（`../ios/zkfx`）。

UI 对齐 Figma：`weiwei-wzx`（通过渲染 Figma 画板导出的 PNG，并叠加热点实现点击流转）。

## Requirements

- Node.js `>= 20.19.0`（当前使用 Vite 7；低于该版本会出现 `crypto.hash is not a function`）

## Dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
