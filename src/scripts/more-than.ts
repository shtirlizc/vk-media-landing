import { Swiper } from "swiper";

const AUTOPLAY_TIME = 4000;

export function moreThan() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const body: HTMLElement | null = document.querySelector(".more-than__body");
  const previousButton: HTMLButtonElement | null = document.querySelector(
    ".js-more-than-swiper .more-than__navigation-button--prev",
  );
  const nextButton: HTMLButtonElement | null = document.querySelector(
    ".js-more-than-swiper .more-than__navigation-button--next",
  );
  const swiper = new Swiper(".js-more-than-swiper", {
    loop: true,
    speed: prefersReducedMotion ? 0 : 600,
    slidesPerView: "auto",
    centeredSlides: true,
    followFinger: true,
    touchRatio: 1,
    spaceBetween: -142.39,
    breakpoints: {
      960: {
        spaceBetween: -172.5,
        touchRatio: 0.25,
      },
      1200: {
        spaceBetween: -102.48,
        touchRatio: 0.25,
      },
      1600: {
        spaceBetween: -141,
        touchRatio: 0.25,
      },
    },
    on: {
      init: setSlideStack,
      click: handleCentralSlideClick,
      slideChangeTransitionStart: setSlideStack,
    },
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

  swiper.el.addEventListener(
    "click",
    (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const bullet = target.closest<HTMLButtonElement>(
        ".more-than__pagination button",
      );

      if (!bullet) {
        return;
      }

      event.stopPropagation();
      swiper.slideToLoop(Number(bullet.dataset.index));
    },
    { capture: true },
  );

  previousButton?.addEventListener("click", () => {
    if (!swiper.animating) {
      swiper.slidePrev();
    }
  });

  nextButton?.addEventListener("click", () => {
    if (!swiper.animating) {
      swiper.slideNext();
    }
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

  function handleCentralSlideClick(event: Swiper) {
    if (
      event.animating ||
      !event.clickedSlide?.classList.contains("is-more-than-slide-active")
    ) {
      return;
    }

    event.slideNext();
  }

  function setSlideStack(event: Swiper) {
    const classNames = [
      "is-more-than-slide-active",
      "is-more-than-slide-prev",
      "is-more-than-slide-next",
      "is-more-than-slide-before",
      "is-more-than-slide-after",
    ];

    event.slides.forEach((slide) => {
      slide.classList.remove(...classNames);
    });

    const setSlideClass = (offset: number, className: string) => {
      const index =
        (event.activeIndex + offset + event.slides.length) %
        event.slides.length;

      event.slides[index]?.classList.add(className);
    };

    setSlideClass(0, "is-more-than-slide-active");
    setSlideClass(-1, "is-more-than-slide-prev");
    setSlideClass(1, "is-more-than-slide-next");
    setSlideClass(-2, "is-more-than-slide-before");
    setSlideClass(2, "is-more-than-slide-after");

    updatePaginationAccessibility(event);
  }

  function setActiveBullet(index: number) {
    getPaginations(swiper).forEach((pagination) => {
      const bullets = pagination.querySelectorAll<HTMLButtonElement>("button");

      bullets.forEach((bullet) => {
        bullet.classList.toggle(
          "active",
          bullet.dataset.index === String(index),
        );
      });
    });
  }

  function setProgress(progress: number) {
    getPaginations(swiper).forEach((pagination) => {
      pagination.style.setProperty("--progress", String(progress));
    });
  }

  function getPaginations(currentSwiper: Swiper) {
    return Array.from(
      currentSwiper.el.querySelectorAll<HTMLElement>(".more-than__pagination"),
    );
  }

  function updatePaginationAccessibility(currentSwiper: Swiper) {
    getPaginations(currentSwiper).forEach((pagination) => {
      const isActive = pagination
        .closest(".swiper-slide")
        ?.classList.contains("is-more-than-slide-active");

      pagination.setAttribute("aria-hidden", String(!isActive));
      pagination
        .querySelectorAll<HTMLButtonElement>("button")
        .forEach((button) => {
          button.tabIndex = isActive ? 0 : -1;
        });
    });
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

    if (prefersReducedMotion) {
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
