import { Swiper } from "swiper";

export function init() {
  console.log("#### init");

  new Swiper(".swiper", {
    loop: true,
  });
}
