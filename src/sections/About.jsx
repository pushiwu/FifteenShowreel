import "./About.css";
import TextReveal from "../components/TextReveal";

const overviewLinks = [
  {
    href: "#projects",
    number: "03",
    zh: "\u6838\u5fc3\u4f5c\u54c1",
    en: "Selected Works",
  },
  {
    href: "#expertise",
    number: "04",
    zh: "\u5de5\u4f5c\u7ef4\u5ea6",
    en: "Working Dimensions",
  },
  {
    href: "#resume",
    number: "10",
    zh: "\u5956\u9879\u4e0e\u5165\u56f4",
    en: "Awards & Selections",
  },
];

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container about-layout">
        <div className="about-content">
          <p className="section-label">
            <TextReveal text="Statement / \u521b\u4f5c\u9648\u8ff0" animateOn="view" speed={18} />
          </p>
          <h2 className="section-title">
            <TextReveal
              text={"\u72b6\u6001\u5148\u4e8e\u9648\u8ff0"}
              animateOn="view"
              speed={16}
            />
          </h2>
          <div className="about-copy">
            <p>
              <TextReveal
                text={"\u6211\u59cb\u7ec8\u76f8\u4fe1\uff0c\u5f53\u4e0b\u7684\u72b6\u6001\u5148\u4e8e\u9648\u8ff0\u3002\u8bb8\u591a\u771f\u6b63\u52a8\u4eba\u7684\u4e1c\u897f\uff0c\u5e76\u4e0d\u6025\u4e8e\u88ab\u8bf4\u660e\uff0c\u5b83\u9996\u5148\u505c\u7559\u5728\u4eba\u7684\u795e\u60c5\u3001\u52a8\u4f5c\u3001\u505c\u987f\u4e0e\u6c89\u9ed8\u91cc\u3002\u5f53\u72b6\u6001\u88ab\u51c6\u786e\u6355\u6349\uff0c\u6545\u4e8b\u4fbf\u4f1a\u81ea\u7136\u751f\u957f\u3002"}
                animateOn="view"
                speed={10}
              />
            </p>
            <p>
              <TextReveal
                text={"\u6bd4\u8d77\u76f4\u63a5\u89e3\u91ca\u4eba\u7269\uff0c\u6211\u66f4\u5728\u610f\u753b\u9762\u4e2d\u4eba\u4e0e\u73af\u5883\u4e4b\u95f4\u7684\u5173\u7cfb\u3002\u5bf9\u6211\u6765\u8bf4\uff0c\u955c\u5934\u4e0d\u662f\u4e3a\u4e86\u5c55\u793a\uff0c\u800c\u662f\u4e3a\u4e86\u7559\u4e0b\u65e5\u5e38\u4e2d\u8f6c\u77ac\u5373\u901d\u7684\u65f6\u523b\uff1a\u5149\u7ebf\u63a0\u8fc7\u9762\u5b54\u65f6\u7684\u8fdf\u7591\uff0c\u7a7a\u95f4\u6c89\u9ed8\u4e0b\u6765\u65f6\u7684\u5f20\u529b\uff0c\u4ee5\u53ca\u60c5\u7eea\u5c1a\u672a\u6765\u5f97\u53ca\u547d\u540d\u4fbf\u5df2\u5916\u6ea2\u7684\u75d5\u8ff9\u3002"}
                animateOn="view"
                speed={10}
              />
            </p>
            <p>
              <TextReveal
                text={"\u4eba\u7269\u5e38\u5e38\u662f\u73af\u5883\u7684\u7ed3\u679c\uff0c\u800c\u73af\u5883\u4e5f\u4e0d\u4ec5\u662f\u7a7a\u95f4\u672c\u8eab\uff0c\u5b83\u5305\u542b\u5149\u7ebf\u3001\u7a7a\u6c14\u3001\u58f0\u97f3\uff0c\u4ee5\u53ca\u60c5\u7eea\u5728\u5176\u4e2d\u6d41\u52a8\u7684\u65b9\u5f0f\u3002\u521b\u4f5c\u4e0d\u662f\u5957\u7528\u56fa\u5b9a\u7684\u65b9\u6cd5\uff0c\u800c\u662f\u5728\u5177\u4f53\u7684\u4eba\u3001\u7a7a\u95f4\u4e0e\u60c5\u7eea\u4e4b\u4e2d\uff0c\u627e\u5230\u90a3\u4e2a\u6545\u4e8b\u771f\u6b63\u9002\u5408\u88ab\u89c2\u770b\u7684\u65b9\u5f0f\u3002"}
                animateOn="view"
                speed={10}
              />
            </p>
          </div>

          <nav className="about-overview-links" aria-label="Portfolio overview">
            {overviewLinks.map((item) => (
              <a className="about-overview-link" href={item.href} key={item.href}>
                <span className="about-overview-number">
                  <TextReveal text={item.number} animateOn="view" sequential={false} speed={14} />
                </span>
                <span className="about-overview-copy">
                  <strong>
                    <TextReveal text={item.zh} animateOn="view" speed={14} />
                  </strong>
                  <small>
                    <TextReveal text={item.en} animateOn="view" sequential={false} speed={12} />
                  </small>
                </span>
                <span className="about-overview-arrow" aria-hidden="true">
                  &gt;
                </span>
              </a>
            ))}
          </nav>
        </div>

        <div className="about-media">
          <div className="about-visual">
            <span className="about-visual-glow" aria-hidden="true" />
            <img
              className="about-image"
              src="/about-profile.png"
              alt="\u84b2\u5e08\u6b66"
            />
            <span className="about-visual-caption">
              <TextReveal
                text="Image creator / Cinematography / Lighting / Camera / DIT"
                animateOn="view"
                sequential={false}
                speed={12}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
