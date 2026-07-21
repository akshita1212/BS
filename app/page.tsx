"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

const FRAME_COUNT = 151;
const CUSTOM_SOLUTIONS_KEY = "ekl-custom-solutions-v1";

type Solution = {
  id: string;
  phase: string;
  title: string;
  description: string;
};

type StoryScene = {
  progress: number;
  chapter: number;
  localProgress: number;
};

type FrameRender = {
  primaryFrame: number;
  secondaryFrame?: number;
  blend: number;
};

const defaultSolutions: Solution[] = [
  {
    id: "opportunity-intelligence",
    phase: "Imagine",
    title: "Opportunity intelligence",
    description:
      "Find the moments where AI can create meaningful value—and shape them into a focused transformation agenda.",
  },
  {
    id: "connected-data",
    phase: "Connect",
    title: "Connected data foundation",
    description:
      "Bring customer, dealer, product and field signals together so every decision starts with shared intelligence.",
  },
  {
    id: "adaptive-operations",
    phase: "Activate",
    title: "Adaptive operations",
    description:
      "Turn live insight into precise action across planning, service, supply and the moments that move the business.",
  },
  {
    id: "intelligent-experiences",
    phase: "Grow",
    title: "Intelligent experiences",
    description:
      "Create useful, personal experiences that learn continuously—for teams, partners, dealers and customers.",
  },
];

const frameTemplates = {
  intro: [0, 34],
  leftLeaf: [34, 76],
  rightLeaf: [77, 112],
  bloom: [112, 150],
} as const;

const CHAPTER_SCROLL_VH = 125;
const TEMPLATE_BLEND_WINDOW = 0.16;
const TEMPLATE_HOLD_WINDOW = 0.08;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function interpolateFrame(range: readonly [number, number], progress: number) {
  return range[0] + (range[1] - range[0]) * clamp(progress);
}

function smoothstep(value: number) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

function templateForSolution(index: number) {
  return index % 2 === 0 ? frameTemplates.leftLeaf : frameTemplates.rightLeaf;
}

function frameRenderForScene(chapter: number, localProgress: number, solutionCount: number): FrameRender {
  if (chapter === 0) {
    return {
      primaryFrame: interpolateFrame(frameTemplates.intro, localProgress),
      blend: 0,
    };
  }

  const isFinale = chapter > solutionCount;
  const currentTemplate = isFinale
    ? frameTemplates.bloom
    : templateForSolution(chapter - 1);
  const previousTemplate = chapter === 1
    ? frameTemplates.intro
    : templateForSolution(Math.min(chapter - 2, solutionCount - 1));

  if (localProgress < TEMPLATE_BLEND_WINDOW) {
    return {
      primaryFrame: previousTemplate[1],
      secondaryFrame: currentTemplate[0],
      blend: smoothstep(localProgress / TEMPLATE_BLEND_WINDOW),
    };
  }

  const animationEnd = 1 - TEMPLATE_HOLD_WINDOW;
  const templateProgress = clamp(
    (localProgress - TEMPLATE_BLEND_WINDOW) /
      (animationEnd - TEMPLATE_BLEND_WINDOW),
  );

  return {
    primaryFrame: interpolateFrame(currentTemplate, templateProgress),
    blend: 0,
  };
}

function frameRenderForTimeline(timeline: number, totalChapters: number, solutionCount: number) {
  const boundedTimeline = clamp(timeline, 0, totalChapters);
  const chapter = Math.min(totalChapters - 1, Math.floor(boundedTimeline));
  const localProgress = boundedTimeline >= totalChapters
    ? 1
    : boundedTimeline - chapter;
  return frameRenderForScene(chapter, localProgress, solutionCount);
}

function framePath(index: number) {
  return `/frames/frame-${String(index).padStart(3, "0")}.jpg`;
}

function chapterLabel(chapter: number, solutionCount: number) {
  if (chapter === 0) return "Seed";
  if (chapter > solutionCount) return "Finale";
  return `Solution ${chapter} of ${solutionCount}`;
}

function SiteHeader({
  progress,
  chapter,
  totalChapters,
  onAddSolution,
}: {
  progress: number;
  chapter: number;
  totalChapters: number;
  onAddSolution: () => void;
}) {
  const current = String(chapter + 1).padStart(2, "0");
  const total = String(totalChapters).padStart(2, "0");

  return (
    <header className="siteHeader">
      <a className="brandLockup" href="#top" aria-label="AI Re-Imagination Summit home">
        <span className="brandMark" aria-hidden="true">✦</span>
        <span>
          <strong>AI RE-IMAGINATION</strong>
          <small>SUMMIT 2026</small>
        </span>
      </a>

      <div className="headerMeta" aria-label={`Growth chapter ${chapter + 1} of ${totalChapters}`}>
        <span className="chapterCount">{current} / {total}</span>
        <span className="headerRule" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
        <button className="addSolutionButton" type="button" onClick={onAddSolution}>
          <span aria-hidden="true">＋</span> Add solution
        </button>
        <a className="bloomLink" href="#story-end">View the bloom <span aria-hidden="true">↘</span></a>
      </div>
    </header>
  );
}

function SolutionCard({
  solution,
  index,
  total,
  side,
  visible,
}: {
  solution: Solution;
  index: number;
  total: number;
  side: "left" | "right";
  visible: boolean;
}) {
  return (
    <article
      className={`solutionCard solutionCard--${side} ${visible ? "isVisible" : ""}`}
      style={{ "--card-top": "43%" } as CSSProperties}
      aria-hidden={!visible}
    >
      <span className="branchLine" aria-hidden="true"><i /></span>
      <div className="cardTopline">
        <span>{solution.phase}</span>
        <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
      <h2>{solution.title}</h2>
      <p>{solution.description}</p>
      <span className="cardLifecycle"><i /> Appears and recedes with this leaf</span>
    </article>
  );
}

function FinalOffering({ visible, solutionCount }: { visible: boolean; solutionCount: number }) {
  const noun = solutionCount === 1 ? "solution" : "solutions";

  return (
    <section
      id="story-end"
      className={`finalOffering ${visible ? "isVisible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="finalKicker"><span aria-hidden="true">✦</span> The complete offering</div>
      <div className="finalCopy">
        <h2><em>{solutionCount}</em> connected {noun}. One growth ecosystem.</h2>
        <p>Every solution strengthens the whole—designed to compound into one complete transformation offering.</p>
      </div>
      <a href="mailto:hello@merkle.com" tabIndex={visible ? 0 : -1}>
        Start the conversation <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}

function ChapterControls({
  chapter,
  solutionCount,
  totalChapters,
  onNavigate,
}: {
  chapter: number;
  solutionCount: number;
  totalChapters: number;
  onNavigate: (chapter: number) => void;
}) {
  return (
    <aside className="chapterControls" aria-label="Story chapter controls">
      <button
        type="button"
        onClick={() => onNavigate(chapter + 1)}
        disabled={chapter >= totalChapters - 1}
        aria-label="Progress to the next solution"
        aria-keyshortcuts="ArrowUp"
      >
        <kbd>↑</kbd><span>Next</span>
      </button>
      <div>
        <small>Current chapter</small>
        <strong>{chapterLabel(chapter, solutionCount)}</strong>
        <span>Use ↑ to progress · ↓ to regress</span>
      </div>
      <button
        type="button"
        onClick={() => onNavigate(chapter - 1)}
        disabled={chapter <= 0}
        aria-label="Return to the previous solution"
        aria-keyshortcuts="ArrowDown"
      >
        <kbd>↓</kbd><span>Previous</span>
      </button>
    </aside>
  );
}

function AddSolutionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (solution: Pick<Solution, "title" | "description">) => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    titleRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (!cleanTitle || !cleanDescription) return;
    onAdd({ title: cleanTitle, description: cleanDescription });
  };

  return (
    <div
      className="modalBackdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="solutionModal" role="dialog" aria-modal="true" aria-labelledby="add-solution-title">
        <button className="modalClose" type="button" onClick={onClose} aria-label="Close add solution form">×</button>
        <span className="modalEyebrow"><i /> Grow the ecosystem</span>
        <h2 id="add-solution-title">Add a new solution</h2>
        <p>Your solution becomes a new leaf chapter and is saved on this device.</p>

        <form onSubmit={submit}>
          <label htmlFor="solution-title">Solution title</label>
          <input
            ref={titleRef}
            id="solution-title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            placeholder="e.g. Predictive field service"
            required
          />

          <label htmlFor="solution-description">Short description</label>
          <textarea
            id="solution-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={280}
            rows={5}
            placeholder="Describe the value this solution adds to the ecosystem."
            required
          />

          <div className="formFooter">
            <span>{description.length} / 280</span>
            <div>
              <button className="cancelButton" type="button" onClick={onClose}>Cancel</button>
              <button className="submitButton" type="submit">Add solution <span aria-hidden="true">↗</span></button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function StaticExperience({
  solutions,
  onAddSolution,
}: {
  solutions: Solution[];
  onAddSolution: () => void;
}) {
  const totalChapters = solutions.length + 2;

  return (
    <main id="top" className="staticExperience">
      <SiteHeader
        progress={1}
        chapter={totalChapters - 1}
        totalChapters={totalChapters}
        onAddSolution={onAddSolution}
      />
      <section className="staticHero">
        <img src={framePath(FRAME_COUNT - 1)} alt="A magical beanstalk in full bloom" />
        <div className="staticHeroCopy">
          <span className="eyebrow"><i /> A living system for intelligent growth</span>
          <h1>Every breakthrough<br />starts as a <em>seed.</em></h1>
          <p>{solutions.length} connected solutions grow into one complete transformation ecosystem.</p>
        </div>
      </section>
      <section className="staticSolutions" aria-label="Solution ecosystem">
        {solutions.map((solution, index) => (
          <SolutionCard
            key={solution.id}
            solution={solution}
            index={index}
            total={solutions.length}
            side={index % 2 === 0 ? "left" : "right"}
            visible
          />
        ))}
      </section>
      <FinalOffering visible solutionCount={solutions.length} />
    </main>
  );
}

export default function Home() {
  const storyRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<Array<HTMLImageElement | undefined>>([]);
  const targetTimelineRef = useRef(0);
  const currentTimelineRef = useRef(0);
  const totalChaptersRef = useRef(defaultSolutions.length + 2);
  const solutionCountRef = useRef(defaultSolutions.length);
  const animationRef = useRef<number | null>(null);
  const startAnimationRef = useRef<() => void>(() => undefined);
  const pendingChapterRef = useRef<number | null>(null);
  const [customSolutions, setCustomSolutions] = useState<Solution[]>([]);
  const [scene, setScene] = useState<StoryScene>({ progress: 0, chapter: 0, localProgress: 0 });
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [staticMode, setStaticMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const solutions = [...defaultSolutions, ...customSolutions];
  const solutionCount = solutions.length;
  const totalChapters = solutionCount + 2;

  totalChaptersRef.current = totalChapters;
  solutionCountRef.current = solutionCount;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CUSTOM_SOLUTIONS_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) return;
      const valid = parsed.filter((item): item is Solution => {
        if (!item || typeof item !== "object") return false;
        const candidate = item as Partial<Solution>;
        return (
          typeof candidate.id === "string" &&
          typeof candidate.phase === "string" &&
          typeof candidate.title === "string" &&
          typeof candidate.description === "string"
        );
      });
      setCustomSolutions(valid);
    } catch {
      // Ignore malformed device-local data and keep the curated defaults.
    }
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stickySupported = CSS.supports("position", "sticky");
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });

    if (reduceMotion || !stickySupported || !canvas || !context) {
      setStaticMode(true);
      return;
    }

    let cancelled = false;
    let loaded = 0;
    const frames = new Array<HTMLImageElement | undefined>(FRAME_COUNT);
    framesRef.current = frames;

    const nearestLoadedFrame = (requested: number) => {
      const exact = frames[requested];
      if (exact?.complete && exact.naturalWidth) return exact;

      for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
        const before = frames[requested - offset];
        if (before?.complete && before.naturalWidth) return before;
        const after = frames[requested + offset];
        if (after?.complete && after.naturalWidth) return after;
      }
      return undefined;
    };

    const drawCover = (image: HTMLImageElement, opacity = 1) => {
      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;
      context.globalAlpha = opacity;
      context.drawImage(image, x, y, width, height);
    };

    const drawRender = (render: FrameRender) => {
      const primary = nearestLoadedFrame(Math.round(render.primaryFrame));
      if (!primary) return;

      context.globalAlpha = 1;
      drawCover(primary);

      if (render.secondaryFrame !== undefined && render.blend > 0) {
        const secondary = nearestLoadedFrame(Math.round(render.secondaryFrame));
        if (secondary) drawCover(secondary, render.blend);
      }

      context.globalAlpha = 1;
    };

    const animate = () => {
      const difference = targetTimelineRef.current - currentTimelineRef.current;
      currentTimelineRef.current += difference * 0.16;
      drawRender(
        frameRenderForTimeline(
          currentTimelineRef.current,
          totalChaptersRef.current,
          solutionCountRef.current,
        ),
      );

      if (Math.abs(difference) > 0.0005) {
        animationRef.current = window.requestAnimationFrame(animate);
      } else {
        currentTimelineRef.current = targetTimelineRef.current;
        drawRender(
          frameRenderForTimeline(
            currentTimelineRef.current,
            totalChaptersRef.current,
            solutionCountRef.current,
          ),
        );
        animationRef.current = null;
      }
    };

    startAnimationRef.current = () => {
      if (animationRef.current === null) {
        animationRef.current = window.requestAnimationFrame(animate);
      }
    };

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(window.innerWidth * pixelRatio));
      const height = Math.max(1, Math.round(window.innerHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      drawRender(
        frameRenderForTimeline(
          currentTimelineRef.current,
          totalChaptersRef.current,
          solutionCountRef.current,
        ),
      );
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    for (let index = 0; index < FRAME_COUNT; index += 1) {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (cancelled) return;
        loaded += 1;
        setLoadedFrames(loaded);
        const currentRender = frameRenderForTimeline(
          currentTimelineRef.current,
          totalChaptersRef.current,
          solutionCountRef.current,
        );
        const isCurrentPrimary = index === Math.round(currentRender.primaryFrame);
        const isCurrentSecondary = currentRender.secondaryFrame !== undefined &&
          index === Math.round(currentRender.secondaryFrame);
        if (index === 0 || isCurrentPrimary || isCurrentSecondary) {
          drawRender(
            currentRender,
          );
        }
      };
      image.src = framePath(index);
      frames[index] = image;
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (staticMode) return;

    const onScroll = () => {
      const story = storyRef.current;
      if (!story) return;
      const distance = Math.max(1, story.offsetHeight - window.innerHeight);
      const raw = clamp((window.scrollY - story.offsetTop) / distance);
      const scaled = raw * totalChapters;
      const chapter = Math.min(totalChapters - 1, Math.floor(scaled));
      const localProgress = raw === 1 ? 1 : scaled - Math.floor(scaled);
      targetTimelineRef.current = scaled;
      setScene({
        progress: Math.round(raw * 1000) / 1000,
        chapter,
        localProgress: Math.round(localProgress * 1000) / 1000,
      });
      startAnimationRef.current();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [solutionCount, staticMode, totalChapters]);

  const scrollToChapter = useCallback((requestedChapter: number) => {
    const story = storyRef.current;
    if (!story) return;
    const chapter = clamp(requestedChapter, 0, totalChapters - 1);
    const distance = Math.max(1, story.offsetHeight - window.innerHeight);
    const chapterProgress = (chapter + 0.5) / totalChapters;
    window.scrollTo({
      top: story.offsetTop + chapterProgress * distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [totalChapters]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (modalOpen || target?.matches("input, textarea, select, button")) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        scrollToChapter(scene.chapter + 1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        scrollToChapter(scene.chapter - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, scene.chapter, scrollToChapter]);

  useEffect(() => {
    if (pendingChapterRef.current === null || staticMode) return;
    const chapter = pendingChapterRef.current;
    pendingChapterRef.current = null;
    const timer = window.setTimeout(() => scrollToChapter(chapter), 80);
    return () => window.clearTimeout(timer);
  }, [customSolutions.length, scrollToChapter, staticMode]);

  const addSolution = (input: Pick<Solution, "title" | "description">) => {
    const solution: Solution = {
      id: `custom-${Date.now()}`,
      phase: "New solution",
      title: input.title,
      description: input.description,
    };
    const next = [...customSolutions, solution];
    setCustomSolutions(next);
    window.localStorage.setItem(CUSTOM_SOLUTIONS_KEY, JSON.stringify(next));
    pendingChapterRef.current = defaultSolutions.length + next.length;
    setModalOpen(false);
  };

  const modal = modalOpen ? (
    <AddSolutionModal onClose={() => setModalOpen(false)} onAdd={addSolution} />
  ) : null;

  if (staticMode) {
    return (
      <>
        <StaticExperience solutions={solutions} onAddSolution={() => setModalOpen(true)} />
        {modal}
      </>
    );
  }

  const loadProgress = loadedFrames / FRAME_COUNT;
  const heroProgress = scene.chapter === 0 ? clamp(scene.localProgress / 0.78) : 1;
  const activeSolutionIndex = scene.chapter > 0 && scene.chapter <= solutionCount ? scene.chapter - 1 : -1;
  const cardVisible = activeSolutionIndex >= 0 && scene.localProgress >= 0.16 && scene.localProgress <= 0.82;
  const finaleVisible = scene.chapter === totalChapters - 1 && scene.localProgress >= 0.34;

  return (
    <>
      <main id="top">
        <SiteHeader
          progress={scene.progress}
          chapter={scene.chapter}
          totalChapters={totalChapters}
          onAddSolution={() => setModalOpen(true)}
        />

        <section
          ref={storyRef}
          className="growthStory"
          style={{ height: `${100 + totalChapters * CHAPTER_SCROLL_VH}svh` }}
          aria-label="Scroll-driven solution story"
        >
          <div className="stickyStage">
            <img className="posterFrame" src={framePath(0)} alt="" aria-hidden="true" />
            <canvas
              ref={canvasRef}
              className="growthCanvas"
              width="1280"
              height="720"
              aria-label="A magical seed grows leaves and blooms as you move through each solution"
            />
            <div className="cinematicWash" aria-hidden="true" />
            <div className="filmGrain" aria-hidden="true" />

            <section
              className="heroCopy"
              style={{
                opacity: 1 - heroProgress,
                transform: `translateY(${-heroProgress * 24}px)`,
                pointerEvents: heroProgress > 0.96 ? "none" : "auto",
              }}
            >
              <span className="eyebrow"><i /> A living system for intelligent growth</span>
              <h1>Every breakthrough<br />starts as a <em>seed.</em></h1>
              <p>Each solution grows as a single leaf, then makes way for the next. Together, they bloom.</p>
            </section>

            <div className="solutionsLayer" aria-live="polite">
              {solutions.map((solution, index) => (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  index={index}
                  total={solutionCount}
                  side={index % 2 === 0 ? "left" : "right"}
                  visible={cardVisible && activeSolutionIndex === index}
                />
              ))}
            </div>

            <FinalOffering visible={finaleVisible} solutionCount={solutionCount} />

            <ChapterControls
              chapter={scene.chapter}
              solutionCount={solutionCount}
              totalChapters={totalChapters}
              onNavigate={scrollToChapter}
            />

            <div className={`scrollCue ${scene.chapter > 0 || scene.localProgress > 0.3 ? "isHidden" : ""}`} aria-hidden="true">
              <span className="scrollMouse"><i /></span>
              <span>Scroll or press ↑ to cultivate</span>
            </div>

            <div className={`loadingSequence ${loadProgress >= 1 ? "isLoaded" : ""}`} aria-live="polite">
              <span>Preparing the growth sequence</span>
              <i><b style={{ transform: `scaleX(${loadProgress})` }} /></i>
              <strong>{Math.round(loadProgress * 100)}%</strong>
            </div>

            <aside className="progressRail" aria-label={`${Math.round(scene.progress * 100)} percent through the growth story`}>
              <span>Seed</span>
              <i><b style={{ transform: `scaleY(${scene.progress})` }} /></i>
              <span>Bloom</span>
            </aside>
          </div>
        </section>

        <noscript>
          <section className="noScriptFallback">
            <img src={framePath(FRAME_COUNT - 1)} alt="A magical beanstalk in full bloom" />
            <h1>{solutionCount} connected solutions. One growth ecosystem.</h1>
            <p>Every solution strengthens the whole—designed to compound into one complete transformation offering.</p>
          </section>
        </noscript>
      </main>
      {modal}
    </>
  );
}
