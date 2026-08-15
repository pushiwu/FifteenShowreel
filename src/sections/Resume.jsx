import SectionMotion from "../components/SectionMotion";
import "./Resume.css";

const awards = [
  ["第十七届全国大学生广告艺术大赛视频类微电影广告湖南省一等奖", "1st Prize, Hunan Division, 17th National Advertising Art Design Competition for College Students"],
  ["第十八届全国大学生广告艺术大赛视频类微电影广告湖南省三等奖", "Third Prize, Hunan Division, 18th National Advertising Art Design Competition for College Students"],
  ["第十届湖南省公益广告大赛二等奖", "Second Prize, 10th Hunan Public Service Advertising Competition"],
  ["第十一届湖南省公益广告大赛二等奖", "Second Prize, 11th Hunan Public Service Advertising Competition"],
  ["第十五届粤光杯学生影视作品大赛最佳剧情片、最佳声音艺术奖", "Best Narrative Film and Best Sound Art, 15th Yueguang Cup Student Film & Television Works Competition"],
  ["入围罗德岛国际电影节半决赛", "Semi-finalist, Rhode Island International Film Festival"],
  ["入围多伦多国际诺莱坞电影节", "Official Selection, Toronto International Nollywood Film Festival"],
  ["入围亚洲国际青年电影节", "Official Selection, Asian International Youth Film Festival"],
  ["入围金鹄青年电影节", "Official Selection, Jinhu Youth Film Festival"],
  ["入围极光之夜大学生微电影节", "Official Selection, Aurora Night Student Micro-film Carnival"],
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
