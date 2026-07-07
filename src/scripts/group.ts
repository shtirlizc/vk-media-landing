import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type StackMode = "desktop" | "mobile";

type CardState = {
  x: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
};

type Slot = Omit<CardState, "zIndex">;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

export function initGroup() {
  const sections = gsap.utils.toArray<HTMLElement>(".group");

  sections.forEach((section) => {
    const pin = section.querySelector<HTMLElement>(".group__pin");
    const cards = gsap.utils.toArray<HTMLElement>(
      section.querySelectorAll("[data-group-card]"),
    );

    if (!pin || cards.length === 0) return;

    const media = gsap.matchMedia();

    media.add("(min-width: 960px)", () =>
      createGroupScroll(section, pin, cards, "desktop"),
    );
    media.add("(max-width: 959px)", () =>
      createGroupScroll(section, pin, cards, "mobile"),
    );
  });
}

function createGroupScroll(
  section: HTMLElement,
  pin: HTMLElement,
  cards: HTMLElement[],
  mode: StackMode,
) {
  let activeIndex = -1;

  const render = (progress: number) => {
    const cardWidth = cards[0]?.offsetWidth ?? 0;
    const deckWidth = cards[0]?.parentElement?.clientWidth ?? cardWidth;
    const slots = getSlots(cardWidth, deckWidth, mode);
    const rawIndex = progress * (cards.length - 1);
    const nextActiveIndex = clamp(Math.round(rawIndex), 0, cards.length - 1);

    if (nextActiveIndex !== activeIndex) {
      cards.forEach((card, index) => {
        card.classList.toggle("is-active", index === nextActiveIndex);
      });
      activeIndex = nextActiveIndex;
    }

    cards.forEach((card, index) => {
      const state = getCardState(index - rawIndex, slots, cardWidth);

      gsap.set(card, {
        x: state.x,
        scale: state.scale,
        opacity: state.opacity,
        filter: `blur(${state.blur}px)`,
        zIndex: state.zIndex,
        force3D: true,
      });
    });
  };

  render(0);

  const trigger = ScrollTrigger.create({
    trigger: section,
    pin,
    start: "top top",
    end: () => `+=${window.innerHeight}`,
    scrub: true,
    invalidateOnRefresh: true,
    onRefresh: (self) => render(self.progress),
    onUpdate: (self) => render(self.progress),
  });

  return () => {
    trigger.kill();
    activeIndex = -1;
    gsap.set(cards, { clearProps: "transform,filter,opacity,zIndex" });
    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === 0);
    });
  };
}

function getSlots(cardWidth: number, deckWidth: number, mode: StackMode): Slot[] {
  if (mode === "mobile") {
    return [
      { x: 0, scale: 1, opacity: 1, blur: 0 },
      { x: cardWidth * 0.82, scale: 0.86, opacity: 1, blur: 3 },
    ];
  }

  const lastScale = 0.6;
  const lastX = Math.max(cardWidth * 1.41, deckWidth - cardWidth * lastScale);

  return [
    { x: 0, scale: 1, opacity: 1, blur: 0 },
    { x: lastX * 0.42, scale: 0.82, opacity: 1, blur: 2.5 },
    { x: lastX * 0.69, scale: 0.7, opacity: 1, blur: 5 },
    { x: lastX, scale: lastScale, opacity: 1, blur: 7 },
  ];
}

function getCardState(
  relativeIndex: number,
  slots: Slot[],
  cardWidth: number,
): CardState {
  if (relativeIndex < 0) {
    const progress = clamp(Math.abs(relativeIndex), 0, 1);

    return {
      x: -cardWidth * 1.18 * progress,
      scale: mix(1, 0.92, progress),
      opacity: mix(1, 0, progress),
      blur: 0,
      zIndex: 120,
    };
  }

  const lastSlotIndex = slots.length - 1;

  if (relativeIndex <= lastSlotIndex) {
    const fromIndex = Math.floor(relativeIndex);
    const toIndex = Math.min(Math.ceil(relativeIndex), lastSlotIndex);
    const progress = relativeIndex - fromIndex;
    const from = slots[fromIndex];
    const to = slots[toIndex];

    return {
      x: mix(from.x, to.x, progress),
      scale: mix(from.scale, to.scale, progress),
      opacity: mix(from.opacity, to.opacity, progress),
      blur: mix(from.blur, to.blur, progress),
      zIndex: Math.round(100 - relativeIndex * 10),
    };
  }

  const lastSlot = slots[lastSlotIndex];
  const overflowProgress = clamp(relativeIndex - lastSlotIndex, 0, 1);

  return {
    x: lastSlot.x + cardWidth * 0.16 * overflowProgress,
    scale: lastSlot.scale,
    opacity: mix(lastSlot.opacity, 0, overflowProgress),
    blur: lastSlot.blur + 2 * overflowProgress,
    zIndex: 1,
  };
}
