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
  let autoplayVideoMetadataHandler: (() => void) | null = null;
  let progressAnimationFrame: number | undefined;

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

  function setProgress(progress: number) {
    pagination?.style.setProperty("--progress", String(progress));
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
      autoplayVideoEndedHandler = null;
    }

    if (autoplayVideo && autoplayVideoMetadataHandler) {
      autoplayVideo.removeEventListener(
        "loadedmetadata",
        autoplayVideoMetadataHandler,
      );
      autoplayVideoMetadataHandler = null;
    }

    autoplayVideo = null;

    if (progressAnimationFrame !== undefined) {
      window.cancelAnimationFrame(progressAnimationFrame);
      progressAnimationFrame = undefined;
    }
  }

  function activateSlide(slide: HTMLElement | undefined) {
    clearAutoplay();
    setProgress(0);

    if (!isBodyActive) {
      return;
    }

    const video = getSlideVideo(slide);

    if (video) {
      playVideo(slide);
      startVideoProgress(video);
      autoplayVideo = video;
      autoplayVideoEndedHandler = () => {
        clearAutoplay();
        setProgress(1);
        swiper.slideNext();
      };
      autoplayVideo.addEventListener("ended", autoplayVideoEndedHandler, {
        once: true,
      });

      return;
    }

    startTimerProgress(AUTOPLAY_TIME);
    autoplayTimer = window.setTimeout(() => {
      autoplayTimer = undefined;
      setProgress(1);
      swiper.slideNext();
    }, AUTOPLAY_TIME);
  }

  function startTimerProgress(duration: number) {
    const startTime = performance.now();

    const updateProgress = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setProgress(progress);

      if (progress < 1) {
        progressAnimationFrame = window.requestAnimationFrame(updateProgress);
      }
    };

    progressAnimationFrame = window.requestAnimationFrame(updateProgress);
  }

  function startVideoProgress(video: HTMLVideoElement) {
    const updateProgress = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setProgress(Math.min(video.currentTime / video.duration, 1));
      }

      if (!video.ended) {
        progressAnimationFrame = window.requestAnimationFrame(updateProgress);
      }
    };

    if (Number.isFinite(video.duration) && video.duration > 0) {
      updateProgress();
      return;
    }

    autoplayVideoMetadataHandler = () => {
      updateProgress();
    };
    video.addEventListener("loadedmetadata", autoplayVideoMetadataHandler, {
      once: true,
    });
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
