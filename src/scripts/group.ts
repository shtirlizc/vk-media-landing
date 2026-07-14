import { Swiper } from "swiper";

export function initGroup() {
  document
    .querySelectorAll<HTMLElement>(".js-group-swiper")
    .forEach((slider) => {
      new Swiper(slider, {
        loop: true,
        speed: 600,
        slidesPerView: 2,
        breakpoints: {
          960: {
            // The fourth card is brought into view by the stacked treatment.
            slidesPerView: 3,
          },
        },
        on: {
          init: setSlideStack,
          slideChange: setSlideStack,
        },
      });
    });
}

function setSlideStack(swiper: Swiper) {
  swiper.slides.forEach((slide) => {
    slide.classList.remove(
      "is-group-slide-0",
      "is-group-slide-1",
      "is-group-slide-2",
      "is-group-slide-3",
    );
  });

  for (let index = 0; index < 4; index += 1) {
    const slide =
      swiper.slides[(swiper.activeIndex + index) % swiper.slides.length];

    slide?.classList.add(`is-group-slide-${index}`);
  }
}
