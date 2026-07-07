import { Swiper } from "swiper";

const AUTOPLAY_TIME = 4000;

export function moreThan() {
  const body: HTMLElement | null = document.querySelector(".more-than__body");
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
  let isBodyActive = false;
  let autoplayTimer: number | undefined;
  let autoplayVideo: HTMLVideoElement | null = null;
  let autoplayVideoEndedHandler: (() => void) | null = null;

  if (body) {
    let isBodyInCenter = false;
    let isBodyPastExitLine = false;

    const updateBodyActive = () => {
      const nextIsBodyActive = isBodyInCenter && !isBodyPastExitLine;

      if (nextIsBodyActive === isBodyActive) {
        return;
      }

      isBodyActive = nextIsBodyActive;
      body.classList.toggle("active", isBodyActive);

      if (isBodyActive) {
        activateSlide(getActiveSlide());
      } else {
        clearAutoplay();
        stopVideo(getActiveSlide());
      }
    };

    const centerObserver = new IntersectionObserver(
      ([entry]) => {
        isBodyInCenter = entry.isIntersecting;
        updateBodyActive();
      },
      {
        rootMargin: "-49% 0px -49% 0px",
      },
    );

    const exitObserver = new IntersectionObserver(
      ([entry]) => {
        const exitLine = window.innerHeight * 0.6;

        if (entry.isIntersecting) {
          isBodyPastExitLine = false;
        } else if (entry.boundingClientRect.bottom < exitLine) {
          isBodyPastExitLine = true;
        }

        updateBodyActive();
      },
      {
        rootMargin: "-60% 0px -38% 0px",
      },
    );

    centerObserver.observe(body);
    exitObserver.observe(body);
  }

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

    activateSlide(activeSlide);
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

  function getActiveSlide() {
    return swiper.slides[swiper.activeIndex] as HTMLElement | undefined;
  }

  function clearAutoplay() {
    if (autoplayTimer !== undefined) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = undefined;
    }

    if (autoplayVideo && autoplayVideoEndedHandler) {
      autoplayVideo.removeEventListener("ended", autoplayVideoEndedHandler);
      autoplayVideo = null;
      autoplayVideoEndedHandler = null;
    }
  }

  function activateSlide(slide: HTMLElement | undefined) {
    clearAutoplay();

    if (!isBodyActive) {
      return;
    }

    const video = getSlideVideo(slide);

    if (video) {
      playVideo(slide);
      autoplayVideo = video;
      autoplayVideoEndedHandler = () => {
        clearAutoplay();
        swiper.slideNext();
      };
      autoplayVideo.addEventListener("ended", autoplayVideoEndedHandler, {
        once: true,
      });

      return;
    }

    autoplayTimer = window.setTimeout(() => {
      autoplayTimer = undefined;
      swiper.slideNext();
    }, AUTOPLAY_TIME);
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
