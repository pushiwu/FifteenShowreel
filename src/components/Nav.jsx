import { useEffect, useState } from "react";
import TextReveal from "./TextReveal";
import "./Nav.css";

const links = [
  { href: "#home", label: "\u9996\u9875" },
  { href: "#about", label: "\u521b\u4f5c\u9648\u8ff0" },
  { href: "#projects", label: "\u6838\u5fc3\u4f5c\u54c1" },
  { href: "#expertise", label: "\u5de5\u4f5c\u7ef4\u5ea6" },
  { href: "#resume", label: "\u5c65\u5386\u5956\u9879" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        frame = 0;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <a
        href="#home"
        className="nav-logo"
        aria-label="\u84b2\u5e08\u6b66\u4e2a\u4eba\u4f5c\u54c1\u96c6\u9996\u9875"
      >
        <TextReveal text="Fifteen" animateOn="hover" sequential={false} speed={18} />
        <span>Pu</span>
      </a>
      <ul className="nav-links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>
              <TextReveal text={link.label} animateOn="hover" sequential={false} speed={18} />
            </a>
          </li>
        ))}
      </ul>
      <a href="#contact" className="nav-cta">
        <TextReveal
          text={"\u8054\u7cfb\u5408\u4f5c"}
          animateOn="hover"
          sequential={false}
          speed={18}
        />
      </a>
    </nav>
  );
}
