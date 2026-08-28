import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import GlareHover from "../components/GlareHover";
import { getMotionSettings, MOTION_EASES } from "../utils/motionSystem";
import { copyText } from "../utils/clipboard";
import packageJson from "../../package.json";
import "./Contact.css";

gsap.registerPlugin(ScrollTrigger);

const methods = [
  { label: "\u90ae\u7bb1", value: "2493627661@qq.com", href: "mailto:2493627661@qq.com" },
  { label: "\u5fae\u4fe1", value: "17674570906", copyable: true },
  {
    label: "\u5c0f\u7ea2\u4e66",
    value: "Fifteen Pu",
    href: "https://xhslink.cn/m/8BjFMwU35im",
    external: true,
  },
];

export default function Contact() {
  const wrapperRef = useRef(null);
  const giantTextRef = useRef(null);
  const contentRef = useRef(null);
  const [copyState, setCopyState] = useState("idle");
  const copyTimerRef = useRef(null);

  const handleCopyWechat = async () => {
    const copied = await copyText("17674570906");
    setCopyState(copied ? "success" : "failure");
    window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopyState("idle"), 2200);
  };

  useLayoutEffect(() => () => window.clearTimeout(copyTimerRef.current), []);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const giantText = giantTextRef.current;
    const content = contentRef.current;
    if (!wrapper || !giantText || !content) return undefined;

    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const compact = window.matchMedia("(max-width: 700px)").matches;
      const settings = getMotionSettings({ compact, reducedMotion });
      const entranceTargets = Array.from(
        content.querySelectorAll("[data-contact-motion]"),
      );

      if (reducedMotion) {
        gsap.set([giantText, ...entranceTargets], { clearProps: "all" });
        return;
      }

      gsap.fromTo(
        giantText,
        { yPercent: 20, scale: 0.88, opacity: 0.08 },
        {
          yPercent: -2,
          scale: 1,
          opacity: 0.38,
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1.1,
          },
        },
      );

      const title = content.querySelector('[data-contact-motion="title"]');
      const heading = content.querySelector('[data-contact-motion="heading"]');
      const copy = content.querySelector('[data-contact-motion="copy"]');
      const methods = Array.from(content.querySelectorAll('[data-contact-motion="method"]'));
      const supporting = Array.from(content.querySelectorAll('[data-contact-motion="supporting"]'));
      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: MOTION_EASES.entrance },
        onComplete: () => gsap.set(entranceTargets, { clearProps: "willChange" }),
        scrollTrigger: {
          trigger: wrapper,
          start: "top 78%",
          once: true,
          onEnter: () => {
            gsap.set(entranceTargets, { willChange: "transform,opacity,clip-path,filter" });
            timeline.play(0);
          },
        },
      });

      timeline
        .fromTo(
          title,
          { autoAlpha: 0, x: -settings.travel, scaleX: 0.58, clipPath: "inset(0 100% 0 0)" },
          { autoAlpha: 1, x: 0, scaleX: 1, clipPath: "inset(0 0% 0 0)", duration: settings.entranceDuration },
          0,
        )
        .fromTo(
          heading,
          { autoAlpha: 0, y: settings.travel * 0.55, scaleY: 0.62, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, scaleY: 1, clipPath: "inset(0 0 0% 0)", duration: settings.entranceDuration * 0.94 },
          0.18,
        )
        .fromTo(
          copy,
          { autoAlpha: 0, y: settings.travel * 0.3 },
          { autoAlpha: 1, y: 0, duration: settings.entranceDuration * 0.7 },
          0.46,
        )
        .fromTo(
          methods,
          { autoAlpha: 0, y: settings.travel * 0.38, clipPath: "inset(100% 0 0 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: settings.entranceDuration * 0.72, stagger: settings.stagger },
          0.64,
        )
        .fromTo(
          supporting,
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, duration: settings.entranceDuration * 0.62, stagger: 0.12 },
          0.94,
        );

    }, wrapper);

    return () => context.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <section ref={wrapperRef} className="contact-curtain" id="contact">
      <footer className="contact">
        <div className="contact-grid" aria-hidden="true" />
        <div className="contact-aurora" aria-hidden="true" />
        <div className="contact-giant" aria-hidden="true">
          <span ref={giantTextRef} className="contact-giant__text">FIFTEEN</span>
        </div>

        <div ref={contentRef} className="contact-panel">
          <p data-contact-motion="title" className="contact-label">Contact</p>
          <h2 data-contact-motion="heading" className="contact-title">
            {"\u6b22\u8fce\u77ed\u7247\u3001\u5e7f\u544a\u4e0e\u4eba\u7269\u5f71\u50cf\u5408\u4f5c"}
          </h2>
          <p data-contact-motion="copy" className="contact-subtitle">
            {"\u5982\u679c\u4f60\u6b63\u5728\u5bfb\u627e\u517c\u987e\u753b\u9762\u6c14\u8d28\u4e0e\u73b0\u573a\u6267\u884c\u6548\u7387\u7684\u5408\u4f5c\u5bf9\u8c61\uff0c\u6211\u4eec\u53ef\u4ee5\u804a\u804a\u9879\u76ee\u672c\u8eab\u3002"}
          </p>

          <div className="contact-methods">
            {methods.map((item) => (
              <div data-contact-motion="method" className="contact-method-motion" key={item.label}>
                <GlareHover
                as={item.copyable ? "button" : "a"}
                className="contact-method"
                href={item.copyable ? undefined : item.href}
                type={item.copyable ? "button" : undefined}
                onClick={item.copyable ? handleCopyWechat : undefined}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                width="100%"
                height="auto"
                background="linear-gradient(145deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.015))"
                borderRadius="999px"
                borderColor="rgba(255, 255, 255, 0.1)"
                glareColor="#e3e3e3"
                glareOpacity={0.16}
                glareAngle={-28}
                glareSize={260}
                transitionDuration={900}
              >
                <span className="contact-method-label">{item.label}</span>
                <span className="contact-method-value">{item.value}</span>
                {item.copyable ? (
                  <span className={`contact-copy-status is-${copyState}`} role="status" aria-live="polite">
                    {copyState === "success" ? "已复制" : copyState === "failure" ? "请手动复制" : "点击复制"}
                  </span>
                ) : null}
                </GlareHover>
              </div>
            ))}
          </div>

          <div data-contact-motion="supporting" className="contact-wechat-card">
            <div className="contact-wechat-copy">
              <span className="contact-method-label">WeChat</span>
              <strong>Scan to connect</strong>
              <p>通过微信二维码联系我，适合项目合作与现场沟通。</p>
            </div>
            <a
              className="contact-wechat-qr-link"
              href="/contact-wechat-qr.jpg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open WeChat QR code"
            >
              <img
                className="contact-wechat-qr"
                src="/contact-wechat-qr.jpg"
                alt="WeChat QR code"
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>

          <div data-contact-motion="supporting" className="contact-bottom">
            <p className="contact-footer">
              FifteenShowreel v{packageJson.version}
            </p>
            <button
              className="contact-top"
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
