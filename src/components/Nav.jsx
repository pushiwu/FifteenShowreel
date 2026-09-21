import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import TextReveal from "./TextReveal";
import "./Nav.css";

const links = [
  { href: "#home", label: "\u9996\u9875", labelEn: "Home" },
  { href: "#about", label: "\u521b\u4f5c\u9648\u8ff0", labelEn: "Statement" },
  { href: "#projects", label: "\u6838\u5fc3\u4f5c\u54c1", labelEn: "Selected Works" },
  { href: "#expertise", label: "\u5de5\u4f5c\u7ef4\u5ea6", labelEn: "Practice" },
  { href: "#resume", label: "\u5c65\u5386\u5956\u9879", labelEn: "Awards" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOutside = (event) => {
      if (!navRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const handleResize = () => {
      if (desktopQuery.matches) setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleResize);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleResize);
    };
  }, [menuOpen]);

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
    <nav ref={navRef} aria-label="\u4e3b\u5bfc\u822a" className={`nav ${scrolled ? "scrolled" : ""} ${menuOpen ? "menu-open" : ""}`}>
      <a
        href="#home"
        className="nav-logo"
        onClick={() => setMenuOpen(false)}
        aria-label="\u84b2\u5e08\u6b66\u4e2a\u4eba\u4f5c\u54c1\u96c6\u9996\u9875"
      >
        <TextReveal text="Fifteen" animateOn="hover" sequential={false} speed={18} />
        <span> Pu</span>
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
      <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
        <TextReveal
          text={"\u8054\u7cfb\u5408\u4f5c"}
          animateOn="hover"
          sequential={false}
          speed={18}
        />
      </a>
      <button
        ref={menuButtonRef}
        type="button"
        className="nav-menu-toggle"
        aria-label={menuOpen ? "\u5173\u95ed\u5bfc\u822a\u83dc\u5355" : "\u6253\u5f00\u5bfc\u822a\u83dc\u5355"}
        title={menuOpen ? "\u5173\u95ed\u5bfc\u822a\u83dc\u5355" : "\u6253\u5f00\u5bfc\u822a\u83dc\u5355"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>
      <ul id="mobile-navigation" className="nav-mobile-links" hidden={!menuOpen}>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} onClick={() => setMenuOpen(false)}>
              <span>{link.label}</span>
              <span className="nav-mobile-link-en" lang="en">{link.labelEn}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
