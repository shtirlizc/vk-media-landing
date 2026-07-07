import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

export function initHeader() {
  initHeaderActiveNav();

  const buttons = document.querySelectorAll<HTMLButtonElement>(
    "[data-header-burger]",
  );

  buttons.forEach((button) => {
    const iconPath = button.querySelector<SVGPathElement>(
      "[data-burger-icon] path",
    );
    const closePath = button.querySelector<SVGPathElement>(
      "[data-burger-close-source] path",
    );
    const navId = button.getAttribute("aria-controls");
    const nav = navId ? document.getElementById(navId) : null;
    const header = button.closest<HTMLElement>(".header");

    if (!iconPath || !closePath || !nav || !header) {
      return;
    }

    const menuPath = iconPath.getAttribute("d");
    const xPath = closePath.getAttribute("d");

    if (!menuPath || !xPath) {
      return;
    }

    let isOpen = false;

    const setButtonState = () => {
      button.setAttribute("aria-expanded", String(isOpen));
      button.setAttribute(
        "aria-label",
        isOpen ? "Закрыть меню" : "Открыть меню",
      );
    };

    const animateIcon = () => {
      gsap.to(iconPath, {
        duration: 0.28,
        ease: "power2.inOut",
        morphSVG: isOpen ? xPath : menuPath,
      });
    };

    const animateNav = () => {
      header.classList.toggle("is-open", isOpen);
      nav.classList.toggle("is-open", isOpen);
    };

    const closeMenu = () => {
      if (!isOpen) {
        return;
      }

      isOpen = false;
      setButtonState();
      animateIcon();
      animateNav();
    };

    const resetDesktopState = () => {
      isOpen = false;
      setButtonState();
      header.classList.remove("is-open");
      nav.classList.remove("is-open");
      gsap.set(nav, { clearProps: "all" });
      gsap.set(iconPath, { attr: { d: menuPath } });
    };

    button.addEventListener("click", () => {
      isOpen = !isOpen;
      setButtonState();
      animateIcon();
      animateNav();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    resetDesktopState();
  });
}

function initHeaderActiveNav() {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"),
  );
  const sections = links
    .map((link) => {
      const id = link.hash.slice(1);
      const section = id ? document.getElementById(id) : null;

      return section ? { id, link, section } : null;
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        link: HTMLAnchorElement;
        section: HTMLElement;
      } => item !== null,
    );

  if (!sections.length) {
    return;
  }

  const header = document.querySelector<HTMLElement>(".header");

  const setActiveLink = (activeId: string) => {
    sections.forEach(({ id, link }) => {
      const isActive = id === activeId;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateActiveLink = () => {
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    const activationLine = headerHeight + 1;
    let activeId = sections[0].id;

    sections.forEach(({ id, section }) => {
      const rect = section.getBoundingClientRect();

      if (rect.top <= activationLine && rect.bottom > activationLine) {
        activeId = id;
      }
    });

    setActiveLink(activeId);
  };

  let observer: IntersectionObserver | null = null;

  const observeSections = () => {
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    const bottomMargin = Math.max(0, window.innerHeight - headerHeight - 1);

    observer?.disconnect();
    observer = new IntersectionObserver(updateActiveLink, {
      rootMargin: `-${headerHeight}px 0px -${bottomMargin}px 0px`,
      threshold: 0,
    });

    sections.forEach(({ section }) => {
      observer?.observe(section);
    });

    updateActiveLink();
  };

  window.addEventListener("resize", observeSections, { passive: true });
  observeSections();
}
