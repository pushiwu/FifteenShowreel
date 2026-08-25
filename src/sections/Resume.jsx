import SectionMotion from "../components/SectionMotion";
import "./Resume.css";

const awards = [
  ["入围罗德岛国际电影节半决赛", "Semi-Finalist, Flickers' Rhode Island International Film Festival"],
  ["入围多伦多国际诺莱坞电影节", "Official Selection, Toronto International Nollywood Film Festival"],
  ["第十七届全国大学生广告艺术大赛视频类微电影广告湖南省一等奖", "First Prize, Video (Micro-Film Advertising), Hunan Division, 17th National Advertising Art Design Competition for College Students"],
  ["入围亚洲国际青年电影节", "Official Selection, Asia International Youth Film Festival"],
  ["第十五届粤光杯学生影视作品大赛最佳剧情片、最佳声音艺术奖", "Best Narrative Film and Best Sound Art Award, 15th Yueguang Cup Student Film and Television Works Competition"],
  ["第十一届湖南省大学生公益广告大赛二等奖", "Second Prize, 11th Hunan Provincial College Student Public Service Advertising Competition"],
  ["第十届湖南省大学生公益广告大赛二等奖", "Second Prize, 10th Hunan Provincial College Student Public Service Advertising Competition"],
  ["入围金鹄青年电影节", "Official Selection, Jinhu Youth Film Festival"],
  ["入围“极光之夜”大学生微电影嘉年华", "Official Selection, Aurora Night College Student Microfilm Carnival"],
  ["第十八届全国大学生广告艺术大赛视频类微电影广告湖南省三等奖", "Third Prize, Video (Micro-Film Advertising), Hunan Division, 18th National Advertising Art Design Competition for College Students"],
].map(([zh, en]) => ({ zh, en }));

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
              <span>Fifteen Pu</span><span>Cinematographer / Gaffer / Camera Operator / 1st AC / DIT</span>
            </div>
            <div data-motion="cards" className="resume-awards">
              {awards.map((award, index) => (
                <article className="resume-award" key={award.zh}>
                  <span className="resume-award-index">{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{award.zh}</h3><p>{award.en}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SectionMotion>
  );
}
