import type { EpisodeData } from "../core/EpisodeLoader";
import { clamp01, smoothstep } from "../primitives/Easing";

/** Episode, chapter and series title cards. */
export class TitleLayer {
  private readonly intro: HTMLDivElement;
  private readonly chapterCard: HTMLDivElement;
  private readonly chapterEyebrow: HTMLDivElement;
  private readonly chapterTitle: HTMLDivElement;
  private readonly outro: HTMLDivElement;
  private readonly dim: HTMLDivElement;
  private shownChapter = -1;

  /** `nextHref`: link target for the next episode; null in capture mode. */
  constructor(parent: HTMLElement, private readonly data: EpisodeData, private readonly chapterHead: number,
              nextHref: string | null) {
    this.dim = this.div(parent, "title-dim");
    this.intro = this.div(parent, "title-intro");
    this.intro.innerHTML = `
      <div class="title-series">Information Theory</div>
      <div class="title-episode">Episode ${data.episode.order}</div>
      <div class="title-main">${data.episode.title}</div>
      <div class="title-tagline">From uncertainty to reliable communication</div>
      <div class="intro-flow" aria-hidden="true">
        <div class="intro-node"><span>Source</span><b>X</b></div><div class="intro-arrow">→</div>
        <div class="intro-node"><span>Channel</span><b>P(y|x)</b></div><div class="intro-arrow">→</div>
        <div class="intro-node"><span>Output</span><b>Y</b></div>
      </div>`;
    this.chapterCard = this.div(parent, "title-chapter");
    this.chapterEyebrow = this.div(this.chapterCard, "title-chapter-eyebrow");
    this.chapterTitle = this.div(this.chapterCard, "title-chapter-main");
    this.outro = this.div(parent, "title-outro");
    const nextLine = data.next
      ? `<div class="outro-next-label">Next</div>` + (nextHref
        ? `<a class="outro-next outro-next-link" href="${nextHref}">Episode ${data.next.order} · ${data.next.title} ▸</a>`
        : `<div class="outro-next">Episode ${data.next.order} · ${data.next.title}</div>`)
      : `<div class="outro-next-label">Next</div><div class="outro-next">Continue exploring information and communication</div>`;
    this.outro.innerHTML = `<div class="outro-done">End of Episode ${data.episode.order}</div>${nextLine}`;
    this.outro.querySelector("a")?.addEventListener("click", (ev) => ev.stopPropagation());
  }

  private div(parent: HTMLElement, cls: string): HTMLDivElement {
    const el = document.createElement("div");
    el.className = cls;
    parent.appendChild(el);
    return el;
  }

  update(t: number): void {
    const tl = this.data.timeline;
    const firstStart = tl.chapters.length ? tl.chapters[0].start : tl.duration;
    const lastEnd = tl.chapters.length ? tl.chapters[tl.chapters.length - 1].end : 0;

    const introOpacity = t < firstStart ? smoothstep(0, 0.8, t) * (1 - smoothstep(firstStart - 0.8, firstStart, t)) : 0;
    this.intro.style.opacity = String(introOpacity);
    this.intro.style.visibility = introOpacity > 0 ? "visible" : "hidden";

    const outroOpacity = t >= lastEnd ? smoothstep(lastEnd, lastEnd + 0.8, t) : 0;
    this.outro.style.opacity = String(outroOpacity);
    this.outro.style.visibility = outroOpacity > 0 ? "visible" : "hidden";

    let cardOpacity = 0;
    let chapterIndex = -1;
    for (const ch of tl.chapters) {
      if (t >= ch.start && t < ch.start + this.chapterHead) {
        const local = t - ch.start;
        cardOpacity = smoothstep(0, 0.35, local) * (1 - smoothstep(this.chapterHead - 0.5, this.chapterHead, local));
        chapterIndex = ch.index;
        break;
      }
    }
    if (chapterIndex >= 0 && chapterIndex !== this.shownChapter) {
      const ch = tl.chapters[chapterIndex];
      this.chapterEyebrow.textContent = `Chapter ${ch.index + 1} / ${tl.chapters.length}`;
      this.chapterTitle.textContent = ch.title;
      this.shownChapter = chapterIndex;
    }
    this.chapterCard.style.opacity = String(cardOpacity);
    this.chapterCard.style.visibility = cardOpacity > 0 ? "visible" : "hidden";
    this.dim.style.opacity = String(clamp01(Math.max(introOpacity, outroOpacity, cardOpacity * 0.75)));
  }
}
