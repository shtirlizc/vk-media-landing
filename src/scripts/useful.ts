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

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    invalidateOnRefresh: true,
    onRefresh: () => {
      updateStackOffset(section, head);
      renderCards(section, cards, reduceMotion);
    },
    onUpdate: () => renderCards(section, cards, reduceMotion),
  });

  updateStackOffset(section, head);
  renderCards(section, cards, reduceMotion);

  return () => {
    trigger.kill();
    section.style.removeProperty("--useful-head-top");
    section.style.removeProperty("--useful-stack-top");
    gsap.set(cards, { clearProps: "filter,transform,transformOrigin,zIndex" });
  };
}

function updateStackOffset(section: HTMLElement, head: HTMLElement) {
  const header = document.querySelector<HTMLElement>(".header");
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const headHeight = head.getBoundingClientRect().height;
  const headTop = headerHeight + HEAD_OFFSET;

  section.style.setProperty("--useful-head-top", `${headTop}px`);
  section.style.setProperty(
    "--useful-stack-top",
    `${headTop + headHeight + STACK_GAP}px`,
  );
}

function renderCards(
  section: HTMLElement,
  cards: HTMLElement[],
  reduceMotion: boolean,
) {
  const stackTop = getStackTop(section);
  const cardHeight = cards[0]?.getBoundingClientRect().height ?? 0;
  const scaleDistance = Math.min(cardHeight * 0.7, 160);

  cards.forEach((card, index) => {
    const nextCard = cards[index + 1];
    const progress =
      nextCard && scaleDistance > 0
        ? getCoverProgress(nextCard, stackTop, scaleDistance)
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
  nextCard: HTMLElement,
  stackTop: number,
  scaleDistance: number,
) {
  const distanceToStack = nextCard.getBoundingClientRect().top - stackTop;

  return clamp((scaleDistance - distanceToStack) / scaleDistance, 0, 1);
}

function getStackTop(section: HTMLElement) {
  const rawValue =
    getComputedStyle(section).getPropertyValue("--useful-stack-top");
  const value = Number.parseFloat(rawValue);

  return Number.isFinite(value) ? value : 0;
}
