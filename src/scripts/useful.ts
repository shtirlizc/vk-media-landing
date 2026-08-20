import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MOBILE_QUERY = "(max-width: 767px)";
const HEAD_OFFSET = 12;
const STACK_GAP = 16;
const MIN_SCALE = 0.5;
const MAX_BLUR = 3;

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
  const progress = cards.map(() => 0);

  const renderCard = (index: number) => {
    const card = cards[index];

    if (!card) {
      return;
    }

    const scale = reduceMotion ? 1 : mix(1, MIN_SCALE, progress[index] ?? 0);
    const blur = reduceMotion ? 0 : mix(0, MAX_BLUR, progress[index] ?? 0);

    gsap.set(card, {
      scale,
      filter: blur > 0 ? `blur(${blur}px)` : "none",
      transformOrigin: "center top",
      zIndex: index + 1,
      force3D: true,
    });
  };

  const renderCards = () => cards.forEach((_, index) => renderCard(index));

  renderCards();

  if (reduceMotion) {
    return () => {
      section.style.removeProperty("--useful-head-top");
      section.style.removeProperty("--useful-stack-top");
      gsap.set(cards, {
        clearProps: "filter,transform,transformOrigin,zIndex",
      });
    };
  }

  const refreshMetrics = () => {
    metrics = updateStackMetrics(section, head, cards);
  };
  ScrollTrigger.addEventListener("refreshInit", refreshMetrics);

  const triggers = cards.slice(1).map((nextCard, index) =>
    ScrollTrigger.create({
      trigger: nextCard,
      start: () => `top ${metrics.stackTop + metrics.scaleDistance}`,
      end: () => `top ${metrics.stackTop}`,
      onUpdate: (trigger) => {
        progress[index] = trigger.progress;
        renderCard(index);
      },
      onRefresh: (trigger) => {
        progress[index] = trigger.progress;
        renderCard(index);
      },
    }),
  );

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    ScrollTrigger.removeEventListener("refreshInit", refreshMetrics);
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
