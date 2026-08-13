import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import GlareHover from "../components/GlareHover";
import "./Contact.css";

gsap.registerPlugin(ScrollTrigger);

const methods = [
  { label: "\u7535\u8bdd", value: "15886690296", href: "tel:15886690296" },
  { label: "\u90ae\u7bb1", value: "2493627661@qq.com", href: "mailto:2493627661@qq.com" },
  { label: "\u5fae\u4fe1", value: "17674570906", href: "#" },
];

export default function Contact() {
  const wrapperRef = useRef(null);
  const giantTextRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const giantText = giantTextRef.current;
    const content = contentRef.current;
    if (!wrapper || !giantText || !content) return undefined;

    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        gsap.set([giantText, ...content.children], { clearProps: "all" });
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

      gsap.fromTo(
        content.children,
        { y: 64, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapper,
            start: "top 78%",
            end: "top 26%",
            scrub: 0.9,
          },
        },
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
        <div ref={giantTextRef} className="contact-giant" aria-hidden="true">
          FIFTEEN
        </div>

        <div ref={contentRef} className="contact-panel">
          <p className="contact-label">Contact</p>
          <h2 className="contact-title">
            {"\u6b22\u8fce\u77ed\u7247\u3001\u5e7f\u544a\u4e0e\u4eba\u7269\u5f71\u50cf\u5408\u4f5c"}
          </h2>
          <p className="contact-subtitle">
            {"\u5982\u679c\u4f60\u6b63\u5728\u5bfb\u627e\u517c\u987e\u753b\u9762\u6c14\u8d28\u4e0e\u73b0\u573a\u6267\u884c\u6548\u7387\u7684\u5408\u4f5c\u5bf9\u8c61\uff0c\u6211\u4eec\u53ef\u4ee5\u804a\u804a\u9879\u76ee\u672c\u8eab\u3002"}
          </p>

          <div className="contact-methods">
            {methods.map((item) => (
              <GlareHover
                as="a"
                className="contact-method"
                href={item.href}
                key={item.label}
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
              </GlareHover>
            ))}
          </div>

          <div className="contact-bottom">
            <p className="contact-footer">
              Fifteen Pu Personal Portfolio | Updated August 13, 2026
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
