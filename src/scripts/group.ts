import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type StackMode = "desktop" | "mobile";

type CardState = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
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
    const cardHeight = cards[0]?.offsetHeight ?? 0;
    const deckWidth = cards[0]?.parentElement?.clientWidth ?? cardWidth;
    const slots = getSlots(cardWidth, cardHeight, deckWidth, mode);
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
        y: state.y,
        scaleX: state.scaleX,
        scaleY: state.scaleY,
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

function getSlots(
  cardWidth: number,
  cardHeight: number,
  deckWidth: number,
  mode: StackMode,
): Slot[] {
  if (mode === "mobile") {
    const nextCardScaleX = 0.8195023970170454;
    const nextCardScaleY = 0.8170039479325457;
    const nextCardX = Math.max(
      0,
      Math.min(
        cardWidth * 0.4632034632034632,
        deckWidth - cardWidth * nextCardScaleX,
      ),
    );

    return [
      { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, blur: 0 },
      {
        x: nextCardX,
        y: 0,
        scaleX: nextCardScaleX,
        scaleY: nextCardScaleY,
        opacity: 1,
        blur: 3,
      },
    ];
  }

  const scaleX = [
    1, 0.8125398974397998, 0.6782357352120536, 0.5179162624078396,
  ];
  const scaleY = [
    1, 0.8101099317318925, 0.6762074265524606, 0.5163673329576154,
  ];
  const yFactors = [
    0, 0.0008493583893107476, -0.0006813334527416764, -0.0011621279137156834,
  ];
  const xFactors = [
    0, 0.7248484848484849, 1.3007359307359307, 1.7676623376623375,
  ];
  const lastSlotIndex = scaleX.length - 1;
  const targetLastX = cardWidth * xFactors[lastSlotIndex];
  const availableLastX = Math.max(
    0,
    deckWidth - cardWidth * scaleX[lastSlotIndex],
  );
  const xScale =
    targetLastX > 0 ? Math.min(1, availableLastX / targetLastX) : 1;

  return scaleX.map((scale, index) => ({
    x: cardWidth * xFactors[index] * xScale,
    y: cardHeight * yFactors[index],
    scaleX: scale,
    scaleY: scaleY[index],
    opacity: 1,
    blur: [0, 2.5, 5, 7][index],
  }));
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
      y: 0,
      scaleX: mix(1, 0.92, progress),
      scaleY: mix(1, 0.92, progress),
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
      y: mix(from.y, to.y, progress),
      scaleX: mix(from.scaleX, to.scaleX, progress),
      scaleY: mix(from.scaleY, to.scaleY, progress),
      opacity: mix(from.opacity, to.opacity, progress),
      blur: mix(from.blur, to.blur, progress),
      zIndex: Math.round(100 - relativeIndex * 10),
    };
  }

  const lastSlot = slots[lastSlotIndex];
  const overflowProgress = clamp(relativeIndex - lastSlotIndex, 0, 1);

  return {
    x: lastSlot.x + cardWidth * 0.16 * overflowProgress,
    y: lastSlot.y,
    scaleX: lastSlot.scaleX,
    scaleY: lastSlot.scaleY,
    opacity: mix(lastSlot.opacity, 0, overflowProgress),
    blur: lastSlot.blur + 2 * overflowProgress,
    zIndex: 1,
  };
}
