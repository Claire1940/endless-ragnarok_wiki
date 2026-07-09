"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  Compass,
  Gamepad2,
  Gift,
  Rocket,
  Sparkles,
  Swords,
  Users,
  Wand2,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Tools Grid 导航卡片 → 模块 section 锚点一一对应
const TOOLS_SECTION_IDS = [
  "release-date-and-platforms",
  "editions-and-upgrade-kit",
  "beginner-guide",
  "characters-and-best-roles",
  "builds-and-master-traits",
  "conflux-mode-guide",
  "bosses-and-summons",
  "crossplay-and-online-coop",
];

// 模块标题左侧图标（每个模块不同，lucide-react 直接 import）
const MODULE_HEADER_ICONS = [
  Rocket,
  Boxes,
  Compass,
  Users,
  Wrench,
  Wand2,
  Swords,
  Gamepad2,
];

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.endless-ragnarok.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Endless Ragnarok Wiki",
        description:
          "Complete Endless Ragnarok Wiki covering boss guides, weapon builds, character strategies, quests, and co-op tips for Granblue Fantasy: Relink's action RPG expansion.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Endless Ragnarok - Granblue Fantasy: Relink Expansion",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Endless Ragnarok Wiki",
        alternateName: "Endless Ragnarok",
        url: siteUrl,
        description:
          "Complete Endless Ragnarok Wiki resource hub for boss guides, weapon builds, character strategies, and quest walkthroughs for Granblue Fantasy: Relink",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Endless Ragnarok Wiki - Granblue Fantasy: Relink Expansion",
        },
        sameAs: [
          "https://relink-ragnarok.granbluefantasy.com/en",
          "https://store.steampowered.com/app/3839790/Granblue_Fantasy_Relink__Endless_Ragnarok_Upgrade_Kit_Standard_Edition/",
          "https://discord.com/invite/gbfr",
          "https://www.reddit.com/r/GranblueFantasyRelink/",
          "https://x.com/relink_official",
          "https://www.youtube.com/@relink_official",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Granblue Fantasy: Relink - Endless Ragnarok",
        gamePlatform: [
          "Nintendo Switch 2",
          "PlayStation 5",
          "PlayStation 4",
          "PC (Steam)",
        ],
        applicationCategory: "Game",
        genre: ["Action RPG", "Co-op", "Fantasy"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 4,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://store.steampowered.com/app/3839790/Granblue_Fantasy_Relink__Endless_Ragnarok_Upgrade_Kit_Standard_Edition/",
        },
      },
      {
        "@type": "VideoObject",
        name: "Granblue Fantasy: Relink - Endless Ragnarok | Launch Trailer",
        description:
          'Official Endless Ragnarok launch trailer "Not Forgotten Sky" featuring gameplay and story preview.',
        uploadDate: "2026-07-07",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/bEFYnDCYmvM",
        url: "https://www.youtube.com/watch?v=bEFYnDCYmvM",
      },
    ],
  };

  // Module 5 (Builds) accordion state
  const [buildsExpanded, setBuildsExpanded] = useState<number | null>(0);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // 模块数据数组（用于按索引取眉标图标，section 仍各自独立渲染）
  const moduleKeys = [
    "releaseDateAndPlatforms",
    "editionsAndUpgradeKit",
    "beginnerGuide",
    "charactersAndBestRoles",
    "buildsAndMasterTraits",
    "confluxModeGuide",
    "bossesAndSummons",
    "crossplayAndOnlineCoop",
  ] as const;

  // 通用模块标题区（eyebrow + icon + title + intro）
  const ModuleHeader = ({ index }: { index: number }) => {
    const key = moduleKeys[index];
    const moduleData = t.modules[key];
    const Icon = MODULE_HEADER_ICONS[index];
    return (
      <div className="text-center mb-10 md:mb-14 scroll-reveal">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 md:mb-5 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
          <Icon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {moduleData.eyebrow}
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-[1.1]">
          {moduleData.title}
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
          {moduleData.intro}
        </p>
      </div>
    );
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("editions-and-upgrade-kit")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Gift className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://relink-ragnarok.granbluefantasy.com/en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 区域（容器上限 max-w-5xl） */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="bEFYnDCYmvM"
              title="Granblue Fantasy: Relink - Endless Ragnarok | Launch Trailer"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（位于视频区之后、Latest Updates 之前，容器上限 max-w-5xl） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = TOOLS_SECTION_IDS[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section（Tools Grid 之后） */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Release Date and Platforms（table） */}
      <section id="release-date-and-platforms" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader index={0} />
          {/* Desktop table */}
          <div className="scroll-reveal hidden md:block overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] text-left">
                  <th className="px-4 py-3 font-semibold">Detail</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.releaseDateAndPlatforms.items.map((item: any, i: number) => (
                  <tr key={i} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-semibold text-[hsl(var(--nav-theme-light))]">
                      {item.label}
                    </td>
                    <td className="px-4 py-3">{item.value}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="scroll-reveal md:hidden space-y-3">
            {t.modules.releaseDateAndPlatforms.items.map((item: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-white/5 border border-border rounded-xl"
              >
                <p className="text-xs uppercase tracking-wider text-[hsl(var(--nav-theme-light))] font-semibold mb-1">
                  {item.label}
                </p>
                <p className="font-bold mb-1.5">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Editions and Upgrade Kit（comparison-table） */}
      <section
        id="editions-and-upgrade-kit"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader index={1} />
          {/* Desktop comparison table */}
          <div className="scroll-reveal hidden md:block overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] text-left">
                  <th className="px-4 py-3 font-semibold">Edition</th>
                  <th className="px-4 py-3 font-semibold">Best For</th>
                  <th className="px-4 py-3 font-semibold">Format</th>
                  <th className="px-4 py-3 font-semibold">Includes</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Bonus &amp; Notes</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.editionsAndUpgradeKit.items.map((item: any, i: number) => (
                  <tr key={i} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-semibold">
                      {item.edition}
                      <p className="text-xs text-muted-foreground font-normal mt-1">
                        {item.notes}
                      </p>
                    </td>
                    <td className="px-4 py-3">{item.bestFor}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.format}</td>
                    <td className="px-4 py-3">
                      <ul className="list-disc list-inside space-y-0.5">
                        {item.includes.map((inc: string, ii: number) => (
                          <li key={ii}>{inc}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.price}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile accordion cards */}
          <div className="scroll-reveal md:hidden space-y-3">
            {t.modules.editionsAndUpgradeKit.items.map((item: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-white/5 border border-border rounded-xl"
              >
                <p className="font-bold mb-2">{item.edition}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    {item.bestFor}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    {item.format}
                  </span>
                </div>
                <p className="text-sm font-semibold mb-1">{item.price}</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mb-2 space-y-0.5">
                  {item.includes.map((inc: string, ii: number) => (
                    <li key={ii}>{inc}</li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">Bonus:</span>{" "}
                  {item.bonus}
                </p>
                <p className="text-xs text-muted-foreground">{item.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 3: Beginner Guide（step-by-step） */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader index={2} />
          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.beginnerGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  <p className="text-sm flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span>
                      <span className="font-semibold">Result:</span> {step.result}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 4: Characters and Best Roles（card-list） */}
      <section
        id="characters-and-best-roles"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader index={3} />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.charactersAndBestRoles.items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-lg text-[hsl(var(--nav-theme-light))]">
                    {item.group}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                    {item.roleTag}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.characters.map((c: string, ci: number) => (
                    <span
                      key={ci}
                      className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--nav-theme)/0.08)] border border-[hsl(var(--nav-theme)/0.2)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Best for:</span> {item.bestFor}
                </p>
                <p className="text-sm text-muted-foreground italic">
                  {item.officialContext}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅（模块列表中段停顿） */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 5: Builds and Master Traits（accordion） */}
      <section id="builds-and-master-traits" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader index={4} />
          <div className="scroll-reveal space-y-2">
            {t.modules.buildsAndMasterTraits.faqs.map((faq: any, index: number) => (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setBuildsExpanded(buildsExpanded === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${buildsExpanded === index ? "rotate-180" : ""}`}
                  />
                </button>
                {buildsExpanded === index && (
                  <div className="px-5 pb-5 text-muted-foreground text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 6: Conflux Mode Guide（card-list） */}
      <section
        id="conflux-mode-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader index={5} />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {t.modules.confluxModeGuide.cards.map((card: any, index: number) => (
              <div
                key={index}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <h3 className="font-bold text-lg mb-2 text-[hsl(var(--nav-theme-light))]">
                  {card.name}
                </h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>
          <div className="scroll-reveal flex flex-wrap gap-3 justify-center">
            {t.modules.confluxModeGuide.highlights.map((h: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm"
              >
                <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Bosses and Summons（step-by-step） */}
      <section id="bosses-and-summons" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader index={6} />
          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.bossesAndSummons.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 8: Crossplay and Online Co-op（table） */}
      <section
        id="crossplay-and-online-coop"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader index={7} />
          {/* Desktop table */}
          <div className="scroll-reveal hidden md:block overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] text-left">
                  <th className="px-4 py-3 font-semibold">Detail</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.crossplayAndOnlineCoop.items.map((item: any, i: number) => (
                  <tr key={i} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-semibold text-[hsl(var(--nav-theme-light))]">
                      {item.label}
                    </td>
                    <td className="px-4 py-3">{item.value}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="scroll-reveal md:hidden space-y-3">
            {t.modules.crossplayAndOnlineCoop.items.map((item: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-white/5 border border-border rounded-xl"
              >
                <p className="text-xs uppercase tracking-wider text-[hsl(var(--nav-theme-light))] font-semibold mb-1">
                  {item.label}
                </p>
                <p className="font-bold mb-1.5">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.com/invite/gbfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/relink_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.reddit.com/r/GranblueFantasyRelink/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.reddit}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@relink_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
