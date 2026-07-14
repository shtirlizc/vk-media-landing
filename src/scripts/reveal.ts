export const initReveal = () => {
  const revealElements = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal]"),
  );
  const elementsToReveal = revealElements.slice(1);

  if (!elementsToReveal.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  for (const element of elementsToReveal) {
    element.classList.add("is-reveal-pending");
  }

  if (!("IntersectionObserver" in window)) {
    for (const element of elementsToReveal) {
      element.classList.add("is-visible");
    }

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0,
    },
  );

  for (const element of elementsToReveal) {
    observer.observe(element);
  }
};
