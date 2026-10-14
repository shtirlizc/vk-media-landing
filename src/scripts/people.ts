export function initPeople() {
  const popover = document.getElementById("popover-people");
  const iframe = popover?.querySelector("iframe");
  const marquee = popover?.closest<HTMLElement>(".people__marquee");
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".people__photo[data-video]",
  );

  if (!iframe || !popover) return;

  let playerOrigin: string | undefined;
  let soundRequested = false;

  const sendPlayerCommand = (command: { method: string; volume?: number }) => {
    if (playerOrigin) {
      iframe.contentWindow?.postMessage(command, playerOrigin);
    }
  };

  // Протокол официального VK Video API: vk.com/js/api/videoplayer.js.
  iframe.addEventListener("load", () => {
    sendPlayerCommand({ method: "init" });
  });

  window.addEventListener("message", (event: MessageEvent) => {
    if (
      !playerOrigin ||
      event.origin !== playerOrigin ||
      event.source !== iframe.contentWindow
    ) {
      return;
    }

    if (event.data?.event === "inited") {
      sendPlayerCommand({ method: "set_volume", volume: 1 });
      sendPlayerCommand({ method: "unmute" });
      sendPlayerCommand({ method: "play" });
    }

    if (event.data?.event === "started" && !soundRequested) {
      soundRequested = true;
      sendPlayerCommand({ method: "unmute" });
    }
  });

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const videoUrl = button.dataset.video;

      if (!videoUrl) return;

      const source = new URL(videoUrl);
      source.searchParams.set("js_api", "1");
      playerOrigin = source.origin;
      soundRequested = false;
      iframe.title = `Видео: ${button.querySelector("img")?.alt || "сотрудник"}`;
      iframe.src = source.href;
      popover.showPopover();
      iframe.focus();
    });
  });

  popover.addEventListener("toggle", (event) => {
    if (event.newState === "open") {
      marquee?.setAttribute("data-modal-open", "");
      return;
    }

    marquee?.removeAttribute("data-modal-open");

    if (event.newState === "closed") {
      playerOrigin = undefined;
      soundRequested = false;
      iframe.removeAttribute("src");
    }
  });
}
