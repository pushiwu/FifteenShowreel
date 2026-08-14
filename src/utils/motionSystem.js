import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const MOTION_EASES = Object.freeze({
  entrance: "power4.out",
  settle: "expo.out",
  transition: "power3.inOut",
  editorial: "quart.inOut",
});

const SECTION_SELECTORS = Object.freeze({
  title: '[data-motion="title"]',
  heading: '[data-motion="heading"]',
  copy: '[data-motion="copy"]',
  cards: '[data-motion="cards"] > *',
  media: '[data-motion="media"]',
  meta: '[data-motion="meta"]',
});

export function getMotionSettings({ compact = false, reducedMotion = false } = {}) {
  if (reducedMotion) {
    return {
      reducedMotion: true,
      compact,
      entranceDuration: 0,
      travel: 0,
      stagger: 0,
      parallax: 0,
    };
  }

  return compact
    ? {
        reducedMotion: false,
        compact: true,
        entranceDuration: 1.36,
        travel: 58,
        stagger: 0.11,
        parallax: 2.5,
      }
    : {
        reducedMotion: false,
        compact: false,
        entranceDuration: 1.7,
        travel: 120,
        stagger: 0.15,
        parallax: 5,
      };
}

export function getSectionMotionSelectors() {
  return { ...SECTION_SELECTORS };
}

export function clearAnimatedStyles(targets) {
  const elements = targets.flat().filter(Boolean);
  if (!elements.length) return;
  gsap.set(elements, {
    clearProps: "transform,opacity,visibility,clipPath,filter,willChange",
  });
}

function queryTargets(root) {
  const query = (selector) => Array.from(root.querySelectorAll(selector));
  return {
    title: query(SECTION_SELECTORS.title),
    heading: query(SECTION_SELECTORS.heading),
    copy: query(SECTION_SELECTORS.copy),
    cards: query(SECTION_SELECTORS.cards),
    media: query(SECTION_SELECTORS.media),
    meta: query(SECTION_SELECTORS.meta),
  };
}

export function createSectionTimeline(
  root,
  {
    immediate = false,
    parallaxSelector = "",
    start = "top 82%",
  } = {},
) {
  if (!root) return () => {};

  const media = gsap.matchMedia();
  const context = gsap.context(() => {
    media.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        compact: "(max-width: 700px)",
      },
      (matchContext) => {
        const settings = getMotionSettings({
          compact: matchContext.conditions.compact,
          reducedMotion: matchContext.conditions.reduce,
        });
        const targets = queryTargets(root);
        const allTargets = Object.values(targets).flat();

        if (settings.reducedMotion) {
          clearAnimatedStyles(allTargets);
          root.dataset.revealed = "true";
          return undefined;
        }

        const timeline = gsap.timeline({
          paused: !immediate,
          defaults: { ease: MOTION_EASES.entrance },
          onComplete: () => {
            root.dataset.revealed = "true";
            gsap.set(allTargets, { clearProps: "willChange" });
          },
        });

        if (targets.title.length) {
          timeline.fromTo(
            targets.title,
            {
              autoAlpha: 0,
              x: matchContext.conditions.compact ? -settings.travel : -settings.travel * 1.25,
              scaleX: 0.62,
              filter: matchContext.conditions.compact ? "blur(0px)" : "blur(10px)",
              clipPath: "inset(0 100% 0 0)",
              transformOrigin: "left center",
            },
            {
              autoAlpha: 1,
              x: 0,
              scaleX: 1,
              filter: "blur(0px)",
              clipPath: "inset(0 0% 0 0)",
              duration: settings.entranceDuration,
            },
            0,
          );
        }

        if (targets.heading.length) {
          timeline.fromTo(
            targets.heading,
            { autoAlpha: 0, y: settings.travel * 0.52, scaleY: 0.68, transformOrigin: "bottom" },
            { autoAlpha: 1, y: 0, scaleY: 1, duration: settings.entranceDuration * 0.9 },
            0.2,
          );
        }

        if (targets.copy.length) {
          timeline.fromTo(
            targets.copy,
            { autoAlpha: 0, y: settings.travel * 0.32, clipPath: "inset(0 0 100% 0)" },
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: settings.entranceDuration * 0.76,
              stagger: settings.stagger * 0.65,
            },
            0.38,
          );
        }

        if (targets.media.length) {
          timeline.fromTo(
            targets.media,
            { autoAlpha: 0, y: settings.travel * 0.4, scale: 1.08, clipPath: "inset(14% 0 18% 0)" },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0 0% 0)",
              duration: settings.entranceDuration * 1.05,
              ease: MOTION_EASES.settle,
            },
            0.32,
          );
        }

        if (targets.cards.length) {
          timeline.fromTo(
            targets.cards,
            { autoAlpha: 0, y: settings.travel * 0.42, clipPath: "inset(100% 0 0 0)" },
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0% 0 0 0)",
              duration: settings.entranceDuration * 0.78,
              stagger: settings.stagger,
            },
            0.55,
          );
        }

        if (targets.meta.length) {
          timeline.fromTo(
            targets.meta,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: settings.entranceDuration * 0.6, stagger: 0.08 },
            0.72,
          );
        }

        const playTimeline = () => {
          gsap.set(allTargets, { willChange: "transform,opacity,clip-path,filter" });
          timeline.play(0);
        };

        let trigger = null;
        if (immediate) playTimeline();
        else {
          trigger = ScrollTrigger.create({
            trigger: root,
            start,
            once: true,
            onEnter: playTimeline,
          });
        }

        let parallaxTween = null;
        if (parallaxSelector && settings.parallax > 0) {
          const parallaxTargets = Array.from(root.querySelectorAll(parallaxSelector));
          if (parallaxTargets.length) {
            parallaxTween = gsap.fromTo(
              parallaxTargets,
              { yPercent: -settings.parallax },
              {
                yPercent: settings.parallax,
                ease: "none",
                scrollTrigger: {
                  trigger: root,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.1,
                  invalidateOnRefresh: true,
                },
              },
            );
          }
        }

        root.dataset.revealed = immediate ? "entering" : "waiting";
        return () => {
          trigger?.kill();
          parallaxTween?.kill();
          timeline.kill();
        };
      },
    );
  }, root);

  return () => {
    media.revert();
    context.revert();
  };
}
