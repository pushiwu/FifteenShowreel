import "./About.css";
import AsciiPortrait from "../components/AsciiPortrait";
import GlareHover from "../components/GlareHover";
import SectionMotion from "../components/SectionMotion";
import { ABOUT_PORTRAIT_CONFIG } from "../utils/asciiPortrait";

const overviewLinks = [
  { href: "#projects", number: "03", zh: "核心作品", en: "Selected Works" },
  { href: "#expertise", number: "04", zh: "工作维度", en: "Working Dimensions" },
  { href: "#resume", number: "10", zh: "奖项与入围", en: "Awards & Selections" },
];

const statementParagraphs = [
  {
    zh: "我始终相信，当下的状态先于陈述。许多真正动人的东西，并不急于被说明，它首先停留在人的神情、动作、停顿与沉默里。当状态被准确捕捉，故事便会自然生长。",
    en: "I have always believed that the state of the present precedes explanation. What truly moves us rarely rushes to be articulated; it first remains in a person's expression, movement, pause and silence. When that state is captured precisely, the story begins to grow on its own.",
  },
  {
    zh: "比起直接解释人物，我更在意画面中人与环境之间的关系。对我来说，镜头不是为了展示，而是为了留下日常中转瞬即逝的时刻：光线掠过面孔时的迟疑，空间沉默下来时的张力，以及情绪尚未来得及命名便已外溢的痕迹。",
    en: "Rather than explaining a character directly, I care more about the relationship between people and their surroundings within the frame. For me, the camera is not there to display, but to preserve moments that vanish almost as soon as they appear: hesitation as light crosses a face, tension as a space falls silent, and emotion spilling outward before it can be named.",
  },
  {
    zh: "人物常常是环境的结果，而环境也不仅是空间本身，它包含光线、空气、声音，以及情绪在其中流动的方式。创作不是套用固定的方法，而是在具体的人、空间与情绪之中，找到那个故事真正适合被观看的方式。",
    en: "People are often shaped by their environments, and environment is more than physical space. It includes light, air, sound and the way emotion moves through them. Creation is not the application of a fixed method, but the search, within a specific person, space and feeling, for the way a story truly asks to be seen.",
  },
];

export default function About() {
  return (
    <SectionMotion parallaxSelector=".about-media-parallax" start="top 78%">
      <section className="about" id="about">
        <div className="container about-layout">
          <div className="about-content">
            <p data-motion="title" className="motion-display-title">STATEMENT</p>
            <h2 data-motion="heading" className="section-title">状态先于陈述</h2>
            <div className="about-copy">
              {statementParagraphs.map((paragraph) => (
                <div data-motion="copy" className="about-copy-pair" key={paragraph.zh}>
                  <p>{paragraph.zh}</p>
                  <p className="about-copy-en">{paragraph.en}</p>
                </div>
              ))}
            </div>

            <nav data-motion="cards" className="about-overview-links" aria-label="Portfolio overview">
              {overviewLinks.map((item) => (
                <GlareHover
                  as="a"
                  className="about-overview-link"
                  href={item.href}
                  key={item.href}
                  width="100%"
                  height="auto"
                  background="transparent"
                  borderRadius="0px"
                  borderColor="transparent"
                  glareColor="#d9d9d9"
                  glareOpacity={0.14}
                  glareAngle={-28}
                  glareSize={240}
                  transitionDuration={900}
                >
                  <span className="about-overview-number">{item.number}</span>
                  <span className="about-overview-copy"><strong>{item.zh}</strong><small>{item.en}</small></span>
                  <span className="about-overview-arrow" aria-hidden="true">&gt;</span>
                </GlareHover>
              ))}
            </nav>
          </div>

          <div data-motion="media" className="about-media">
            <div className="about-media-parallax">
              <div className="about-visual">
                <span className="about-visual-glow" aria-hidden="true" />
                <AsciiPortrait
                  className="about-image"
                  imageClassName="about-image-fallback"
                  src="/about-profile-cutout.webp"
                  alt="蒲师武"
                  config={ABOUT_PORTRAIT_CONFIG}
                  imageOpacity={0.82}
                  canvasOpacity={0.22}
                />
                <span data-motion="meta" className="about-visual-caption">
                  Cinematographer / Gaffer / Camera Operator / 1st AC / DIT
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SectionMotion>
  );
}
