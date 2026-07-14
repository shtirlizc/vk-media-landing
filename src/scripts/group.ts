import { Swiper } from "swiper";

const GROUP_SLIDE_COUNT = 4;
const INITIAL_SLIDE = GROUP_SLIDE_COUNT * 2;
const LAST_SLIDE_BEFORE_RESET = GROUP_SLIDE_COUNT * 3;

export function initGroup() {
  document
    .querySelectorAll<HTMLElement>(".js-group-swiper")
    .forEach((slider) => {
      new Swiper(slider, {
        initialSlide: INITIAL_SLIDE,
        speed: 600,
        slidesPerView: 1.81,
        breakpoints: {
          960: {
            // The fourth card is brought into view by the stacked treatment.
            slidesPerView: 3,
          },
        },
        on: {
          breakpoint: (swiper) => setSlideStack(swiper, true),
          init: setSlideStack,
          click: handleGroupSlideClick,
          slideChangeTransitionStart: setSlideStack,
          slideChangeTransitionEnd: clearLeavingSlides,
        },
      });
    });
}

function handleGroupSlideClick(swiper: Swiper) {
  if (swiper.clickedSlide?.classList.contains("is-group-slide-0")) {
    swiper.slideNext();
  }
}

function setSlideStack(swiper: Swiper, skipLeaving = false) {
  const stackSize = getStackSize();
  const isPreviousDirection = swiper.swipeDirection === "prev";
  const leavingIndex = isPreviousDirection
    ? swiper.previousIndex + stackSize - 1
    : swiper.previousIndex;
  const leavingSlide = swiper.slides[leavingIndex];

  if (
    !skipLeaving &&
    swiper.initialized &&
    leavingSlide &&
    swiper.previousIndex !== swiper.activeIndex
  ) {
    leavingSlide.classList.add(
      "is-group-slide-leaving",
      isPreviousDirection
        ? "is-group-slide-leaving--right"
        : "is-group-slide-leaving--left",
    );
  }

  swiper.slides.forEach((slide) => {
    slide.classList.remove(
      "is-group-slide-0",
      "is-group-slide-1",
      "is-group-slide-2",
      "is-group-slide-3",
    );
  });

  for (let index = 0; index < stackSize; index += 1) {
    const slide =
      swiper.slides[(swiper.activeIndex + index) % swiper.slides.length];

    slide?.classList.add(`is-group-slide-${index}`);
  }

  if (!skipLeaving && isPreviousDirection) {
    const activeSlide = swiper.slides[swiper.activeIndex];

    activeSlide?.classList.add("is-group-slide-entering-from-left");
    void activeSlide?.offsetWidth;
    requestAnimationFrame(() => {
      activeSlide?.classList.remove("is-group-slide-entering-from-left");
    });
  }
}

function getStackSize() {
  return window.matchMedia("(width >= 960px)").matches ? 4 : 2;
}

function clearLeavingSlides(swiper: Swiper) {
  swiper.slides.forEach((slide) => {
    slide.classList.remove(
      "is-group-slide-leaving",
      "is-group-slide-leaving--left",
      "is-group-slide-leaving--right",
    );
  });

  if (swiper.activeIndex >= LAST_SLIDE_BEFORE_RESET) {
    swiper.slideTo(INITIAL_SLIDE, 0, false);
    setSlideStack(swiper, true);
  } else if (swiper.activeIndex < GROUP_SLIDE_COUNT) {
    swiper.slideTo(LAST_SLIDE_BEFORE_RESET - 1, 0, false);
    setSlideStack(swiper, true);
  }
}
