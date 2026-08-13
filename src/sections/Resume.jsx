import TextReveal from "../components/TextReveal";
import "./Resume.css";

const awards = [
  {
    zh: "\u7b2c\u5341\u4e03\u5c4a\u5168\u56fd\u5927\u5b66\u751f\u5e7f\u544a\u827a\u672f\u5927\u8d5b\u89c6\u9891\u7c7b\u5fae\u7535\u5f71\u5e7f\u544a\u6e56\u5357\u7701\u4e00\u7b49\u5956",
    en: "1st Prize, Hunan Division, 17th National Advertising Art Design Competition for College Students",
  },
  {
    zh: "\u7b2c\u5341\u516b\u5c4a\u5168\u56fd\u5927\u5b66\u751f\u5e7f\u544a\u827a\u672f\u5927\u8d5b\u89c6\u9891\u7c7b\u5fae\u7535\u5f71\u5e7f\u544a\u6e56\u5357\u7701\u4e09\u7b49\u5956",
    en: "Third Prize, Hunan Division, 18th National Advertising Art Design Competition for College Students",
  },
  {
    zh: "\u7b2c\u5341\u5c4a\u6e56\u5357\u7701\u516c\u76ca\u5e7f\u544a\u5927\u8d5b\u4e8c\u7b49\u5956",
    en: "Second Prize, 10th Hunan Public Service Advertising Competition",
  },
  {
    zh: "\u7b2c\u5341\u4e00\u5c4a\u6e56\u5357\u7701\u516c\u76ca\u5e7f\u544a\u5927\u8d5b\u4e8c\u7b49\u5956",
    en: "Second Prize, 11th Hunan Public Service Advertising Competition",
  },
  {
    zh: "\u7b2c\u5341\u4e94\u5c4a\u7ca4\u5149\u676f\u5b66\u751f\u5f71\u89c6\u4f5c\u54c1\u5927\u8d5b\u6700\u4f73\u5267\u60c5\u7247\u3001\u6700\u4f73\u58f0\u97f3\u827a\u672f\u5956",
    en: "Best Narrative Film and Best Sound Art, 15th Yueguang Cup Student Film & Television Works Competition",
  },
  {
    zh: "\u5165\u56f4\u7f57\u5fb7\u5c9b\u56fd\u9645\u7535\u5f71\u8282\u534a\u51b3\u8d5b",
    en: "Semi-finalist, Rhode Island International Film Festival",
  },
  {
    zh: "\u5165\u56f4\u591a\u4f26\u591a\u56fd\u9645\u8bfa\u83b1\u575e\u7535\u5f71\u8282",
    en: "Official Selection, Toronto International Nollywood Film Festival",
  },
  {
    zh: "\u5165\u56f4\u4e9a\u6d32\u56fd\u9645\u9752\u5e74\u7535\u5f71\u8282",
    en: "Official Selection, Asian International Youth Film Festival",
  },
  {
    zh: "\u5165\u56f4\u91d1\u9e44\u9752\u5e74\u7535\u5f71\u8282",
    en: "Official Selection, Jinhu Youth Film Festival",
  },
  {
    zh: "\u5165\u56f4\u6781\u5149\u4e4b\u591c\u5927\u5b66\u751f\u5fae\u7535\u5f71\u8282",
    en: "Official Selection, Aurora Night Student Micro-film Carnival",
  },
];

export default function Resume() {
  return (
    <section className="resume" id="resume">
      <div className="container resume-layout">
        <div className="resume-heading">
          <p className="section-label">
            <TextReveal text="Credentials" animateOn="view" speed={18} />
          </p>
          <h2 className="section-title">
            <TextReveal text={"\u5c65\u5386\u4e0e\u5956\u9879"} animateOn="view" speed={16} />
          </h2>
          <p className="section-subtitle">
            <TextReveal
              text={"\u8fd9\u4e9b\u7ecf\u5386\u4f5c\u4e3a\u5f71\u50cf\u5b9e\u8df5\u4e4b\u5916\u7684\u4fe1\u4efb\u8bc1\u660e\uff0c\u4f46\u4e0d\u53d6\u4ee3\u4f5c\u54c1\u672c\u8eab\u3002"}
              animateOn="view"
              speed={10}
            />
          </p>
        </div>

        <div className="resume-content">
          <div className="resume-profile-line">
            <span>Fifteen Pu</span>
            <span>Cinematographer / Gaffer / Camera Operator / 1st AC / DIT</span>
          </div>
          <div className="resume-awards">
            {awards.map((award, index) => (
              <article className="resume-award" key={award.zh}>
                <span className="resume-award-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>
                    <TextReveal text={award.zh} animateOn="view" speed={10} />
                  </h3>
                  <p>
                    <TextReveal text={award.en} animateOn="view" sequential={false} speed={9} />
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
