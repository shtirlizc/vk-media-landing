import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type StackMode = "desktop" | "desktop-short" | "mobile";

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

type GroupMetrics = {
  cardWidth: number;
  slots: Slot[];
};

const FULLHD_STACK_COMPRESSION = 0.9;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

export function initGroup() {
  const sections = gsap.utils.toArray<HTMLElement>(".group");

  sections.forEach((section) => {
    const pin = section.querySelector<HTMLElement>(".group__pin");
    const viewport = section.querySelector<HTMLElement>(".group__viewport");
    const cards = gsap.utils.toArray<HTMLElement>(
      section.querySelectorAll("[data-group-card]"),
    );
    const scrollCards = gsap.utils.toArray<HTMLElement>(
      section.querySelectorAll("[data-group-scroll-card]"),
    );

    if (!pin || !viewport || cards.length === 0 || scrollCards.length === 0)
      return;

    const media = gsap.matchMedia();

    media.add("(min-width: 960px) and (min-height: 851px)", () =>
      createGroupScroll(section, pin, cards, scrollCards, "desktop"),
    );
    media.add("(min-width: 960px) and (max-height: 850px)", () =>
      createGroupScroll(section, viewport, cards, scrollCards, "desktop-short"),
    );
    media.add("(max-width: 959px)", () =>
      createGroupScroll(section, pin, cards, scrollCards, "mobile"),
    );
  });
}

function createGroupScroll(
  section: HTMLElement,
  pin: HTMLElement,
  cards: HTMLElement[],
  scrollCards: HTMLElement[],
  mode: StackMode,
) {
  const isShortDesktop = mode === "desktop-short";
  let activeIndex = -1;
  let metrics = getGroupMetrics(cards, mode);

  const render = (progress: number) => {
    const rawIndex = progress * (scrollCards.length - 1);
    const nextActiveIndex = clamp(
      Math.round(rawIndex),
      0,
      scrollCards.length - 1,
    );

    if (nextActiveIndex !== activeIndex) {
      scrollCards.forEach((card, index) => {
        card.classList.toggle("is-active", index === nextActiveIndex);
      });
      activeIndex = nextActiveIndex;
    }

    cards.forEach((card, index) => {
      const state = getCardState(
        index - rawIndex,
        metrics.slots,
        metrics.cardWidth,
      );

      gsap.set(card, {
        x: state.x,
        y: state.y,
        scaleX: state.scaleX,
        scaleY: state.scaleY,
        opacity: state.opacity,
        ...(mode === "mobile"
          ? {}
          : {
              filter: state.blur > 0 ? `blur(${state.blur}px)` : "none",
            }),
        zIndex: state.zIndex,
        force3D: mode === "desktop",
      });
    });
  };

  render(0);

  const trigger = ScrollTrigger.create({
    trigger: isShortDesktop ? pin : section,
    pin,
    start: isShortDesktop
      ? () => `top ${getShortDesktopPinOffset()}px`
      : "top top",
    end: () => `+=${isShortDesktop ? window.innerHeight : pin.offsetHeight}`,
    scrub: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefresh: (self) => {
      metrics = getGroupMetrics(cards, mode);
      render(self.progress);
    },
    onUpdate: (self) => render(self.progress),
  });

  return () => {
    trigger.kill();
    activeIndex = -1;
    gsap.set(cards, { clearProps: "transform,filter,opacity,zIndex" });
    scrollCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === 0);
    });
  };
}

function getShortDesktopPinOffset() {
  const rootStyles = getComputedStyle(document.documentElement);
  const headerHeight = Number.parseFloat(
    rootStyles.getPropertyValue("--header"),
  );
  const gap = Number.parseFloat(rootStyles.getPropertyValue("--space40"));

  return (
    (Number.isFinite(headerHeight) ? headerHeight : 0) +
    (Number.isFinite(gap) ? gap : 40)
  );
}

function getGroupMetrics(cards: HTMLElement[], mode: StackMode): GroupMetrics {
  const cardWidth = cards[0]?.offsetWidth ?? 0;
  const cardHeight = cards[0]?.offsetHeight ?? 0;
  const deckWidth = cards[0]?.parentElement?.clientWidth ?? cardWidth;

  return {
    cardWidth,
    slots: getSlots(cardWidth, cardHeight, deckWidth, mode),
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
    const stackWidth = nextCardX + cardWidth * nextCardScaleX;
    const stackOffsetX = Math.max(0, (deckWidth - stackWidth) / 2);

    return [
      {
        x: stackOffsetX,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        blur: 0,
      },
      {
        x: stackOffsetX + nextCardX,
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
  const fillsDeck = cardWidth >= 485;
  const xScale =
    targetLastX > 0
      ? fillsDeck
        ? (availableLastX / targetLastX) * FULLHD_STACK_COMPRESSION
        : Math.min(1, availableLastX / targetLastX)
      : 1;
  const stackWidth = targetLastX * xScale + cardWidth * scaleX[lastSlotIndex];
  const stackOffsetX = Math.max(0, (deckWidth - stackWidth) / 2);

  return scaleX.map((scale, index) => ({
    x: stackOffsetX + cardWidth * xFactors[index] * xScale,
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
    const activeX = slots[0]?.x ?? 0;

    return {
      x: mix(activeX, -cardWidth * 1.18, progress),
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
