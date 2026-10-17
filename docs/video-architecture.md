# Video architecture

## State and file ownership

| State | Owner | Files |
|---|---|---|
| Course order and production availability | Course registry | `content/series.json` |
| Explanatory intent and source scope | Episode content | `content/episodes/<eid>/storyboard.md` |
| Bilingual sentences and thinking holds | Episode script | `content/episodes/<eid>/story.en.json` |
| Pronunciation substitutions | Explicit lexicon | `content/pronunciation.json` |
| Measured speech and cache identity | Kokoro synthesizer | `build/<eid>/en/audio/sentences/`, `voice-provenance.json` |
| Physical chapter/sentence/caption times | Timeline builder | `build/<eid>/en/timeline.json` |
| Written music notes and semantic anchors | Episode manuscript | `content/episodes/<eid>/score-cues.json` |
| Resolved music events and PCM | Cue compiler and composer | `audio/resolved-score.json`, `audio/music.wav` |
| Voice/music mix | Narration mixer | `audio/mix.wav` |
| Visual state at a requested time | Episode scene | `player/src/episodes/<eid>/` |
| Committed encoded chunks | Capture cache | `build/<eid>/en/render/cache/` |
| Versioned MP4, SRT, cover and manifest | Delivery muxer | `output/<eid>/v<N>/` |
| Defects and observed review coverage | Episode review | `build/<eid>/en/qa/review.md` |

## Explicit boundaries

`SpeechBackend` in `pipeline/rvideo/contracts/speech_backend.py` isolates the speech engine. `KokoroBackend` loads local public weights and the configured voice; `KokoroSynthesizer` owns sentence-cache compatibility. `Story`, `Timeline`, `VoiceProvenance` and `CueSheet` are typed data contracts. The command wrapper sets this project's import path explicitly despite sharing a Python environment with the reference checkout.

`Scene` in `player/src/core/Scene.ts` defines setup and drawing. `SceneRegistry` and episode registry files map chapter IDs explicitly to scene implementations. The renderer supplies one timeline and scene context. Formula, caption, title and Three.js stage layers have separate ownership. The caption layer uses the same measured intervals as speech and the external SRT.

`CueCompiler` resolves written chapter/sentence boundaries to seconds. `MusicComposer` renders the explicit notes with the configured sample bank and room processor. Empty-note prediction cues suppress room tails; no category-based music is invented for missing intervals. The standalone theme has separate ownership from lecture scores.

## Production and recovery

The flow is script validation → measured speech → timeline/subtitles → authored-cue resolution and music → mix → browser scene review → frozen input hashes → capture → full raw decode → immutable mux/check → actual encoded frame review → delivery registration.

Capture uses one worker, 1920×1080, 30 fps, JPEG quality 93 and H.264 medium/CRF18. Segment/chunk plans and module dependency hashes determine cache compatibility. Completed blocks use committed filenames; active partial files are excluded from restart checkpoints. Concatenation rounds PTS and DTS independently to the exact 30-fps grid while preserving encoded payload ordering.

Recovery checks owned processes, environment symlinks, frozen inputs and retained output hashes. Compatible committed blocks can be reused by the original capture command. A complete container alone is insufficient: the raw file and delivered audio/video receive full decode checks, with actual frame counts retained. Delivery files and their directories are flushed before subsequent source promotion.

## Browser playback

`DataSource` selects development build paths or relative static-site paths. `render/build-site.ts` bundles the player and copies only delivered episodes' timelines. It encodes each current mix to AAC using two-pass normalization and writes a content fingerprint into the audio URL. `PreviewClock` owns playback time; controls seek that clock, and audio is resynchronized when its drift exceeds the configured threshold. MP4 exports are independent of this live-rendered site.

The local site has no external publishing dependency. Its normal playback mechanics, chapter navigation, captions and audio-source observations are recorded separately from capture-mode rendering and subjective listening.

## Observed local playback

The complete fourteen-episode static build is observed through normal browser controls across all 81 content chapters. All caption pairs match, all chapter/seek audio targets complete, and all next-episode hrefs follow course order. New static AAC files fully decode and their URL fingerprints match. Chrome cancels superseded byte-range transfers during seeking; focused Network observations record canceled=true and successful HTTP 206 replacements while playback resumes. The exact coverage, timings, hashes and listening boundaries are recorded in `build/playback/qa/review.md`.

## GitHub Pages

The static course is also published at https://luo-jingw.github.io/InformationTheory/ from the root of the `gh-pages` branch. The deployment checkout owns Git publication state independently of the production root. Index scrolling uses a viewport-height body and explicit vertical scrollbar; live playback/capture layout is unchanged. Repository-prefix assets, all fourteen public audio sources and all 81 chapter operations are observed. Exact commit, payload identity and evidence are in `docs/github-pages.md`.
