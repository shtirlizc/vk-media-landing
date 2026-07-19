import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MOBILE_QUERY = "(max-width: 767px)";
const HEAD_OFFSET = 12;
const STACK_GAP = 16;
const MIN_SCALE = 0.5;
const MAX_BLUR = 3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

type StackMetrics = {
  stackTop: number;
  scaleDistance: number;
};

export function initUseful() {
  const sections = gsap.utils.toArray<HTMLElement>("[data-useful]");

  sections.forEach((section) => {
    const head = section.querySelector<HTMLElement>("[data-useful-head]");
    const cards = gsap.utils.toArray<HTMLElement>(
      section.querySelectorAll("[data-useful-card]"),
    );

    if (!head || cards.length === 0) return;

    const media = gsap.matchMedia();

    media.add(MOBILE_QUERY, () => createUsefulStack(section, head, cards));
  });
}

function createUsefulStack(
  section: HTMLElement,
  head: HTMLElement,
  cards: HTMLElement[],
) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let metrics = updateStackMetrics(section, head, cards);

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    invalidateOnRefresh: true,
    onRefresh: () => {
      metrics = updateStackMetrics(section, head, cards);
      renderCards(cards, metrics, reduceMotion);
    },
    onUpdate: () => renderCards(cards, metrics, reduceMotion),
  });

  renderCards(cards, metrics, reduceMotion);

  return () => {
    trigger.kill();
    section.style.removeProperty("--useful-head-top");
    section.style.removeProperty("--useful-stack-top");
    gsap.set(cards, { clearProps: "filter,transform,transformOrigin,zIndex" });
  };
}

function updateStackMetrics(
  section: HTMLElement,
  head: HTMLElement,
  cards: HTMLElement[],
): StackMetrics {
  const header = document.querySelector<HTMLElement>(".header");
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const headHeight = head.getBoundingClientRect().height;
  const headTop = headerHeight + HEAD_OFFSET;
  const stackTop = headTop + headHeight + STACK_GAP;
  const cardHeight = cards[0]?.getBoundingClientRect().height ?? 0;

  section.style.setProperty("--useful-head-top", `${headTop}px`);
  section.style.setProperty("--useful-stack-top", `${stackTop}px`);

  return {
    stackTop,
    scaleDistance: Math.min(cardHeight * 0.7, 160),
  };
}

function renderCards(
  cards: HTMLElement[],
  { stackTop, scaleDistance }: StackMetrics,
  reduceMotion: boolean,
) {
  const nextCardTops = cards.map((_, index) =>
    cards[index + 1]?.getBoundingClientRect().top,
  );

  cards.forEach((card, index) => {
    const nextCardTop = nextCardTops[index];
    const progress =
      nextCardTop !== undefined && scaleDistance > 0
        ? getCoverProgress(nextCardTop, stackTop, scaleDistance)
        : 0;
    const scale = reduceMotion ? 1 : mix(1, MIN_SCALE, progress);
    const blur = reduceMotion ? 0 : mix(0, MAX_BLUR, progress);

    gsap.set(card, {
      scale,
      filter: `blur(${blur}px)`,
      transformOrigin: "center top",
      zIndex: index + 1,
      force3D: true,
    });
  });
}

function getCoverProgress(
  nextCardTop: number,
  stackTop: number,
  scaleDistance: number,
) {
  const distanceToStack = nextCardTop - stackTop;

  return clamp((scaleDistance - distanceToStack) / scaleDistance, 0, 1);
}
