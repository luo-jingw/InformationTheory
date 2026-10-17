# Information Theory from the Ground Up

14 集信息论数学动画课程：英文女声讲解，英文在上、中文在下的双语字幕。内容从熵、信息不等式与统计推断延伸到无损压缩、信道编码、高斯信道及谱水填充。核心结论包含成立条件、推导与具体算例。每集采用对应叙事事件的独立分段配乐。

**在线课程：[GitHub Pages](https://luo-jingw.github.io/InformationTheory/)**

`main` 保存可维护源码；[`gh-pages`](https://github.com/luo-jingw/InformationTheory/tree/gh-pages) 保存完整网页发布产物。

## 目录

| 目录 | 内容 |
|---|---|
| `content/` | 14 集双语脚本、分镜、术语、配乐谱面与句子锚点 |
| `player/src/` | Three.js 动画场景、公式字幕、课程首页和章节播放器 |
| `player/render/` | 确定性逐帧捕获、分块缓存与静态网页构建 |
| `pipeline/rvideo/` | 语音、实测时间轴、配乐、混音、字幕与视频交付管线 |
| `assets/music/` | 乐器采样清单、公开下载地址、校验值及许可文本 |
| `docs/` | 画面编排、状态归属与数学算例说明 |
| `.claude/skills/` | 计划、制作、审查和整理工作流 |

## 开发与构建

播放器使用 Node.js 22，依赖及锁定版本见 `player/package.json` 和 `player/package-lock.json`。准备依赖后可执行：

```bash
cd player
npm run typecheck
npm run dev
```

Python 管线依赖见 `pipeline/pyproject.toml`，运行时读取项目内的 `.venv`。本地 Kokoro 和 Whisper 权重分别放在 `.models/kokoro` 与 `.models/whisper`，乐器录音按 `assets/music/source-records.json` 中的路径和 SHA-256 准备。源码分支不附带这些权重、录音或生成音轨。

以第一集为例，从项目根目录执行：

```bash
pipeline/run.sh validate e01-entropy-information
pipeline/run.sh narrate e01-entropy-information --device cuda
pipeline/run.sh timeline e01-entropy-information
pipeline/run.sh subtitles e01-entropy-information
pipeline/run.sh music e01-entropy-information
pipeline/run.sh mix e01-entropy-information
```

`npm run site:build` 从各集已生成的时间轴和混音构建 `site/`。因此，首次克隆源码后需要先准备这些产物。只想观看课程时，可直接使用在线课程或检出 `gh-pages`。

## 源码发布范围

该分支仅包含轻量文本源码和必要配置。讲义 `notes/`、个人运行记录、凭据、依赖环境、模型、采样、生成媒体与缓存均排除；本次源码快照每个文件不超过 1 MiB。

架构与状态归属见 [video-architecture](docs/video-architecture.md)，场景契约见 [scene-authoring](docs/scene-authoring.md)，具体计算见 [mathematical-examples](docs/mathematical-examples.md)。采样来源与许可保存在 `assets/music/`。
