export function initProducts() {
  document.querySelectorAll<HTMLElement>(".products__row").forEach((row) => {
    const track = row.querySelector<HTMLElement>(".products__track");
    const group = track?.querySelector<HTMLElement>(".products__group");

    if (!track || !group) return;

    const updateRepeats = () => {
      const groupWidth = group.getBoundingClientRect().width;
      if (!groupWidth) return;

      // Keep a full viewport covered even at the end of one group's travel.
      const repeatCount = Math.max(2, Math.ceil(row.clientWidth / groupWidth) + 1);

      while (track.children.length < repeatCount) {
        const duplicate = group.cloneNode(true) as HTMLElement;
        duplicate.setAttribute("aria-hidden", "true");
        duplicate.querySelectorAll("a").forEach((link) => {
          link.tabIndex = -1;
        });
        track.append(duplicate);
      }

      while (track.children.length > repeatCount) {
        track.lastElementChild?.remove();
      }

      // Changing the number of copies must still move exactly one group.
      track.style.setProperty("--products-repeat-count", String(repeatCount));
    };

    updateRepeats();

    const observer = new ResizeObserver(updateRepeats);
    observer.observe(row);
    observer.observe(group);
  });
}
