import SectionMotion from "../components/SectionMotion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { awards } from "../data/awards";
import "./Resume.css";

const initialAwardCount = 6;

function Award({ award, index }) {
  return (
    <article className="resume-award">
      <span className="resume-award-index">{String(index + 1).padStart(2, "0")}</span>
      <div><h3>{award.zh}</h3><p>{award.en}</p></div>
    </article>
  );
}

export default function Resume() {
  return (
    <SectionMotion start="top 82%">
      <section className="resume" id="resume">
        <div className="container resume-layout">
          <div className="resume-heading">
            <div className="resume-heading-motion">
              <p data-motion="title" className="motion-display-title">CREDENTIALS</p>
              <h2 data-motion="heading" className="section-title">履历与奖项</h2>
              <p data-motion="copy" className="section-subtitle">这些经历作为影像实践之外的信任证明，但不取代作品本身。</p>
            </div>
          </div>
          <div className="resume-content">
            <div data-motion="meta" className="resume-profile-line">
              <span>Fifteen Pu</span><span>Director of Photography / Gaffer / Camera Operator / First Assistant Camera / Digital Imaging Technician</span>
            </div>
            <div data-motion="cards" className="resume-awards">
              {awards.slice(0, initialAwardCount).map((award, index) => (
                <Award award={award} index={index} key={award.zh} />
              ))}
            </div>
            {awards.length > initialAwardCount && (
              <details className="resume-more-awards" onToggle={() => ScrollTrigger.refresh()}>
                <summary>
                  <span className="resume-awards-expand">更多奖项与入围 · {awards.length - initialAwardCount} / More Awards &amp; Selections</span>
                  <span className="resume-awards-collapse">收起 / Show Less</span>
                </summary>
                <div className="resume-awards">
                  {awards.slice(initialAwardCount).map((award, index) => (
                    <Award award={award} index={index + initialAwardCount} key={award.zh} />
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </section>
    </SectionMotion>
  );
}
