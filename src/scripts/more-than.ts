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
        pagination?.style.setProperty("--progress", `${(1 - progress) * 100}%`);
      },
    },
  });

  swiper.on("slideChange", (event) => {
    const currentBullet = bullets.find(
      (bullet) => bullet.dataset.index === String(event.activeIndex),
    );

    if (currentBullet) {
      const currentBullet = bullets.find(
        (bullet) => bullet.dataset.index === String(event.activeIndex),
      );

      if (currentBullet) {
        bullets.forEach((bullet) => {
          bullet.classList.remove("active");
        });
        currentBullet.classList.add("active");
      }
    }
  });
}
