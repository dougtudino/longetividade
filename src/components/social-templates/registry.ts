// Registry de templates sociais — Uma (@ux-design-expert)
// Luna escolhe o template baseado no formato do post.

import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from "react";
import PostFeed from "./post-feed";
import PostStory from "./post-story";

export type SocialTemplateComponent = ForwardRefExoticComponent<RefAttributes<HTMLDivElement> & {
  title: string;
  body?: string;
  pillar: "s" | "e" | "m" | "promo";
}>;

export type TemplateEntry = {
  key: string;
  Component: SocialTemplateComponent | ComponentType<{
    ref?: React.Ref<HTMLDivElement>;
    title: string;
    body?: string;
    pillar: "s" | "e" | "m" | "promo";
  }>;
  width: number;
  height: number;
  label: string;
};

export const SOCIAL_TEMPLATES: Record<string, TemplateEntry> = {
  feed: {
    key: "feed",
    Component: PostFeed as unknown as SocialTemplateComponent,
    width: 1080,
    height: 1080,
    label: "Feed (1080x1080)",
  },
  carrossel: {
    key: "feed",
    Component: PostFeed as unknown as SocialTemplateComponent,
    width: 1080,
    height: 1080,
    label: "Carrossel (1080x1080)",
  },
  imagem: {
    key: "feed",
    Component: PostFeed as unknown as SocialTemplateComponent,
    width: 1080,
    height: 1080,
    label: "Imagem (1080x1080)",
  },
  stories: {
    key: "stories",
    Component: PostStory as unknown as SocialTemplateComponent,
    width: 1080,
    height: 1920,
    label: "Stories (1080x1920)",
  },
  reels: {
    key: "stories",
    Component: PostStory as unknown as SocialTemplateComponent,
    width: 1080,
    height: 1920,
    label: "Reels (1080x1920)",
  },
};

export function getTemplateForFormat(format: string): TemplateEntry {
  return SOCIAL_TEMPLATES[format] ?? SOCIAL_TEMPLATES.feed;
}
