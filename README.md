# Information Theory from the Ground Up

A 14-episode animated course in information theory, with English female narration and bilingual subtitles: English above Chinese. Topics range from entropy, information inequalities, and statistical inference to lossless compression, channel coding, Gaussian channels, and spectral water-filling. Core results include their assumptions, derivations, and worked examples. Each episode has an original score with distinct sections aligned to the narrative.

**Watch the course: [GitHub Pages](https://luo-jingw.github.io/InformationTheory/)**

`main` contains the maintained source code. [`gh-pages`](https://github.com/luo-jingw/InformationTheory/tree/gh-pages) contains the complete published website.

## Repository Layout

| Directory | Contents |
|---|---|
| `content/` | Bilingual scripts, storyboards, terminology, music scores, and sentence anchors for all 14 episodes |
| `player/src/` | Three.js animation scenes, equation captions, course homepage, and chapter player |
| `player/render/` | Deterministic frame capture, chunk caching, and static website builds |
| `pipeline/rvideo/` | Narration, measured timelines, music, mixing, subtitles, and video delivery |
| `assets/music/` | Instrument sample manifests, public download URLs, checksums, and licenses |
| `docs/` | Visual composition, state ownership, and worked mathematical examples |
| `.claude/skills/` | Planning, production, review, and project closure workflows |

## Development and Builds

The player uses Node.js 22. Dependencies and locked versions are listed in `player/package.json` and `player/package-lock.json`. Once dependencies are available, run:

```bash
cd player
npm run typecheck
npm run dev
```

Python pipeline dependencies are listed in `pipeline/pyproject.toml`. The pipeline uses the project's `.venv` at runtime. Place local Kokoro and Whisper model weights in `.models/kokoro` and `.models/whisper`, respectively. Prepare instrument recordings using the paths and SHA-256 checksums in `assets/music/source-records.json`. Model weights, recordings, and generated audio tracks are excluded from the source branch.

For example, to produce the audio and subtitles for the first episode, run these commands from the repository root:

```bash
pipeline/run.sh validate e01-entropy-information
pipeline/run.sh narrate e01-entropy-information --device cuda
pipeline/run.sh timeline e01-entropy-information
pipeline/run.sh subtitles e01-entropy-information
pipeline/run.sh music e01-entropy-information
pipeline/run.sh mix e01-entropy-information
```

From `player/`, run `npm run site:build` to build `site/` from the generated episode timelines and audio mixes. These artifacts must be prepared before building from a fresh source checkout. To watch the course, use the online player or check out `gh-pages`.

## Source Publication Scope

This branch contains lightweight text source files and required configuration. Lecture notes in `notes/`, personal operational records, credentials, dependency environments, models, samples, generated media, and caches are excluded. Every file in this source snapshot is at most 1 MiB.

See [Video Architecture](docs/video-architecture.md) for architecture and state ownership, [Scene Authoring](docs/scene-authoring.md) for scene contracts, and [Mathematical Examples](docs/mathematical-examples.md) for worked calculations. Sample sources and licenses are documented in `assets/music/`.
