import { createFileRoute } from "@tanstack/react-router";
import { ShansiApp } from "@/components/ShansiApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SHANSI — Every hour. One winner." },
      { name: "description", content: "Pick four digits and watch the SHANSI counter turn every hour in this play-money game-of-chance demo." },
      { property: "og:title", content: "SHANSI — Every hour. One winner." },
      { property: "og:description", content: "A cinematic hourly Pick-4 game-of-chance experience, built entirely with play money." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShansiApp,
});
