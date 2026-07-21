"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const FRAME_COUNT = 121;

const solutions = [
  {
    index: "01",
    phase: "Imagine",
    title: "Opportunity intelligence",
    description:
      "Find the moments where AI can create meaningful value—and shape them into a focused transformation agenda.",
    side: "left",
    threshold: 0.18,
    top: "58%",
  },
  {
    index: "02",
    phase: "Connect",
    title: "Connected data foundation",
    description:
      "Bring customer, dealer, product and field signals together so every decision starts with shared intelligence.",
    side: "right",
    threshold: 0.43,
    top: "52%",
  },
  {
    index: "03",
    phase: "Activate",
    title: "Adaptive operations",
    description:
      "Turn live insight into precise action across planning, service, supply and the moments that move the business.",
    side: "left",
    threshold: 0.66,
    top: "25%",
  },
  {
    index: "04",
    phase: "Grow",
    title: "Intelligent experiences",
    description:
      "Create useful, personal experiences that learn continuously—for teams, partners, dealers and customers.",
    side: "right",
    threshold: 0.76,
    top: "24%",
  },
] as const;

function framePath(index: number) {
  return `/frames/frame-${String(index).padStart(3, "0")}.jpg`;
}

function SiteHeader({ progress }: { progress: number }) {
  const chapter = Math.min(5, Math.max(1, Math.floor(progress * 5) + 1));

  return (
    <header className="siteHeader">
      <a className="brandLockup" href="#top" aria-label="AI Re-Imagination Summit home">
        <span className="brandMark" aria-hidden="true">✦</span>
        <span>
          <strong>AI RE-IMAGINATION</strong>
          <small>SUMMIT 2026</small>
        </span>
      </a>

      <div className="headerMeta" aria-label={`Growth chapter ${chapter} of 5`}>
        <span className="chapterCount">0{chapter} / 05</span>
        <span className="headerRule" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
        <a className="bloomLink" href="#story-end">View the bloom <span aria-hidden="true">↘</span></a>
      </div>
    </header>
  );
}

function SolutionCard({
  solution,
  visible,
}: {
  solution: (typeof solutions)[number];
  visible: boolean;
}) {
  return (
    <article
      className={`solutionCard solutionCard--${solution.side} ${visible ? "isVisible" : ""}`}
      style={{ "--card-top": solution.top } as CSSProperties}
      aria-hidden={!visible}
    >
      <span className="branchLine" aria-hidden="true"><i /></span>
      <div className="cardTopline">
        <span>{solution.phase}</span>
        <span>{solution.index}</span>
      </div>
      <h2>{solution.title}</h2>
      <p>{solution.description}</p>
      <a href="#story-end" tabIndex={visible ? 0 : -1}>
        Explore the opportunity <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

function FinalOffering({ visible }: { visible: boolean }) {
  return (
    <section
      id="story-end"
      className={`finalOffering ${visible ? "isVisible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="finalKicker"><span aria-hidden="true">✦</span> The complete offering</div>
      <div className="finalCopy">
        <h2>One connected <em>growth ecosystem.</em></h2>
        <p>Strategy, intelligence, experience and delivery—designed to compound together.</p>
      </div>
      <a href="mailto:hello@merkle.com" tabIndex={visible ? 0 : -1}>
        Start the conversation <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}

function StaticExperience() {
  return (
    <main id="top" className="staticExperience">
      <SiteHeader progress={1} />
      <section className="staticHero">
        <img src={framePath(FRAME_COUNT - 1)} alt="A magical beanstalk in full bloom" />
        <div className="staticHeroCopy">
          <span className="eyebrow"><i /> A living system for intelligent growth</span>
          <h1>Every breakthrough<br />starts as a <em>seed.</em></h1>
          <p>Four connected capabilities grow into one complete transformation ecosystem.</p>
        </div>
      </section>
      <section className="staticSolutions" aria-label="Solution ecosystem">
        {solutions.map((solution) => (
          <SolutionCard key={solution.index} solution={solution} visible />
        ))}
      </section>
      <FinalOffering visible />
    </main>
  );
}

export default function Home() {
  const storyRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<Array<HTMLImageElement | undefined>>([]);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stickySupported = CSS.supports("position", "sticky");
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });

    if (reduceMotion || !stickySupported || !canvas || !context) {
      setStaticMode(true);
      setProgress(1);
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

    const drawFrame = (requested: number) => {
      const image = nearestLoadedFrame(requested);
      if (!image) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    const animate = () => {
      const difference = targetFrameRef.current - currentFrameRef.current;
      currentFrameRef.current += difference * 0.14;
      drawFrame(Math.round(currentFrameRef.current));

      if (Math.abs(difference) > 0.04) {
        animationRef.current = window.requestAnimationFrame(animate);
      } else {
        currentFrameRef.current = targetFrameRef.current;
        drawFrame(Math.round(currentFrameRef.current));
        animationRef.current = null;
      }
    };

    const startAnimation = () => {
      if (animationRef.current === null) {
        animationRef.current = window.requestAnimationFrame(animate);
      }
    };

    const onScroll = () => {
      const story = storyRef.current;
      if (!story) return;
      const distance = Math.max(1, story.offsetHeight - window.innerHeight);
      const raw = Math.min(1, Math.max(0, (window.scrollY - story.offsetTop) / distance));
      targetFrameRef.current = raw * (FRAME_COUNT - 1);
      setProgress(Math.round(raw * 1000) / 1000);
      startAnimation();
    };

    for (let index = 0; index < FRAME_COUNT; index += 1) {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (cancelled) return;
        loaded += 1;
        setLoadedFrames(loaded);
        if (index === 0 || index === Math.round(targetFrameRef.current)) {
          drawFrame(Math.round(targetFrameRef.current));
        }
      };
      image.src = framePath(index);
      frames[index] = image;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  if (staticMode) return <StaticExperience />;

  const loadProgress = loadedFrames / FRAME_COUNT;
  const heroProgress = Math.min(1, progress / 0.13);

  return (
    <main id="top">
      <SiteHeader progress={progress} />

      <section ref={storyRef} className="growthStory" aria-label="Scroll-driven solution story">
        <div className="stickyStage">
          <img className="posterFrame" src={framePath(0)} alt="" aria-hidden="true" />
          <canvas
            ref={canvasRef}
            className="growthCanvas"
            width="1280"
            height="720"
            aria-label="A magical seed grows into a flowering beanstalk as you scroll"
          />
          <div className="cinematicWash" aria-hidden="true" />
          <div className="filmGrain" aria-hidden="true" />

          <section
            className="heroCopy"
            style={{
              opacity: 1 - heroProgress,
              transform: `translateY(${-heroProgress * 24}px)`,
            }}
          >
            <span className="eyebrow"><i /> A living system for intelligent growth</span>
            <h1>Every breakthrough<br />starts as a <em>seed.</em></h1>
            <p>Scroll to grow an ecosystem where every capability makes the next one stronger.</p>
          </section>

          <div className="solutionsLayer" aria-live="polite">
            {solutions.map((solution) => (
              <SolutionCard
                key={solution.index}
                solution={solution}
                visible={progress >= solution.threshold}
              />
            ))}
          </div>

          <FinalOffering visible={progress >= 0.88} />

          <div className={`scrollCue ${progress > 0.08 ? "isHidden" : ""}`} aria-hidden="true">
            <span className="scrollMouse"><i /></span>
            <span>Scroll to cultivate</span>
          </div>

          <div className={`loadingSequence ${loadProgress >= 1 ? "isLoaded" : ""}`} aria-live="polite">
            <span>Preparing the growth sequence</span>
            <i><b style={{ transform: `scaleX(${loadProgress})` }} /></i>
            <strong>{Math.round(loadProgress * 100)}%</strong>
          </div>

          <aside className="progressRail" aria-label={`${Math.round(progress * 100)} percent through the growth story`}>
            <span>Seed</span>
            <i><b style={{ transform: `scaleY(${progress})` }} /></i>
            <span>Bloom</span>
          </aside>
        </div>
      </section>

      <noscript>
        <section className="noScriptFallback">
          <img src={framePath(FRAME_COUNT - 1)} alt="A magical beanstalk in full bloom" />
          <h1>One connected growth ecosystem.</h1>
          <p>Strategy, intelligence, experience and delivery—designed to compound together.</p>
        </section>
      </noscript>
    </main>
  );
}
