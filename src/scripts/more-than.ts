import { Swiper } from "swiper";
import { Autoplay } from "swiper/modules";

export function moreThan() {
  const pagination: HTMLElement | null = document.querySelector(
    ".js-more-than-swiper .more-than__pagination",
  );
  let bullets: HTMLElement[] = [];
  if (pagination) {
    bullets = Array.from(pagination.querySelectorAll("button"));
  }

  const swiper = new Swiper(".js-more-than-swiper", {
    modules: [Autoplay],
    loop: true,
    speed: 500,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    },
    on: {
      autoplayTimeLeft(_, __, progress) {
        pagination?.style.setProperty("--progress", String(1 - progress));
      },
    },
  });

  bullets.forEach((bullet) => {
    const index = Number(bullet.dataset.index);

    bullet.addEventListener("click", () => {
      swiper.slideToLoop(index);
    });
  });

  swiper.on("slideChange", (event) => {
    setActiveBullet(event.realIndex);
  });

  function setActiveBullet(index: number) {
    const currentBullet = bullets.find(
      (bullet) => bullet.dataset.index === String(index),
    );

    if (currentBullet) {
      bullets.forEach((bullet) => {
        bullet.classList.remove("active");
      });
      currentBullet.classList.add("active");
    }
  }
}
