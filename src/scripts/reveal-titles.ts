export const initRevealTitles = () => {
  const titles = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal-title]"),
  );
  const revealTitles = titles.slice(1);

  if (!revealTitles.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  for (const title of revealTitles) {
    title.classList.add("is-reveal-pending");
  }

  if (!("IntersectionObserver" in window)) {
    for (const title of revealTitles) {
      title.classList.add("is-visible");
    }

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      }
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0,
    },
  );

  for (const title of revealTitles) {
    observer.observe(title);
  }
};
