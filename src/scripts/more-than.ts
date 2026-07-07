import { Swiper } from "swiper";

export function moreThan() {
  const pagination: HTMLElement | null = document.querySelector(
    ".js-more-than-swiper .more-than__pagination",
  );
  let bullets: HTMLElement[] = [];
  if (pagination) {
    bullets = Array.from(pagination.querySelectorAll("button"));
  }

  const swiper = new Swiper(".js-more-than-swiper", {
    loop: true,
    speed: 300,
  });

  bullets.forEach((bullet) => {
    const index = Number(bullet.dataset.index);

    bullet.addEventListener("click", () => {
      swiper.slideToLoop(index);
    });
  });

  swiper.on("slideChange", (event) => {
    const prevSlide = event.slides[event.previousIndex] as
      HTMLElement | undefined;
    const activeSlide = event.slides[event.activeIndex] as
      HTMLElement | undefined;

    setActiveBullet(event.realIndex);

    stopVideo(prevSlide);
    playVideo(activeSlide);
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

  function getSlideVideo(slide: HTMLElement | undefined) {
    if (slide?.dataset.media !== "video") {
      return null;
    }

    return slide.querySelector("video");
  }

  function stopVideo(slide: HTMLElement | undefined) {
    const video = getSlideVideo(slide);

    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
  }

  function playVideo(slide: HTMLElement | undefined) {
    const video = getSlideVideo(slide);

    if (!video) {
      return;
    }

    const playPromise = video.play();

    if (playPromise) {
      playPromise.catch(() => {
        // Browsers can block autoplay for videos with sound.
      });
    }
  }
}
