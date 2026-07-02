// @ts-check
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  fonts: [
    {
      provider: fontProviders.local(),
      name: "VK Sans Display",
      cssVariable: "--font-primary",
      options: {
        variants: [
          {
            src: [
              "./src/assets/fonts/VKSansDisplay/VKSansDisplay-Regular.woff2",
              "./src/assets/fonts/VKSansDisplay/VKSansDisplay-Regular.woff",
            ],
            weight: "400",
            style: "normal",
          },
          {
            src: [
              "./src/assets/fonts/VKSansDisplay/VKSansDisplay-Medium.woff2",
              "./src/assets/fonts/VKSansDisplay/VKSansDisplay-Medium.woff",
            ],
            weight: "500",
            style: "normal",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "VK Sans Display Expanded",
      cssVariable: "--font-secondary",
      options: {
        variants: [
          {
            src: [
              "./src/assets/fonts/VKSansDisplayExp/VKSansDisplayExp-Lt.woff2",
              "./src/assets/fonts/VKSansDisplayExp/VKSansDisplayExp-Lt.woff",
            ],
            weight: "300",
            style: "normal",
          },
          {
            src: [
              "./src/assets/fonts/VKSansDisplayExp/VKSansDisplayExp-Rg.woff2",
              "./src/assets/fonts/VKSansDisplayExp/VKSansDisplayExp-Rg.woff",
            ],
            weight: "400",
            style: "normal",
          },
          {
            src: [
              "./src/assets/fonts/VKSansDisplayExp/VKSansDisplayExp-Md.woff2",
              "./src/assets/fonts/VKSansDisplayExp/VKSansDisplayExp-Md.woff",
            ],
            weight: "500",
            style: "normal",
          },
          {
            src: [
              "./src/assets/fonts/VKSansDisplayExp/VKSansDisplayExp-Bd.woff2",
              "./src/assets/fonts/VKSansDisplayExp/VKSansDisplayExp-Bd.woff",
            ],
            weight: "700",
            style: "normal",
          },
        ],
      },
    },
  ],
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    build: {
      assetsInlineLimit: (filePath) =>
        filePath.endsWith(".js") ? 1024 * 1024 : false,
    },
  },
});
