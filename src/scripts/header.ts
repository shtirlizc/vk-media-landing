import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

export function initHeader() {
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
