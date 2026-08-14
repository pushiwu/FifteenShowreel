import "./Expertise.css";
import GlareHover from "../components/GlareHover";
import SectionMotion from "../components/SectionMotion";

const expertise = [
  { title: "摄影指导", english: "Director of Photography", desc: "将文本节奏转译为画面节奏，建立镜头语言、场景关系与情绪走向。", items: ["镜头设计与场面调度", "自然主义叙事影调", "夜戏与低照度方案"] },
  { title: "灯光师", english: "Gaffer", desc: "在有限预算和场地条件下，快速组织灯光结构，兼顾效率与质感。", items: ["自然光塑形", "小体量布光执行", "光比与层次控制"] },
  { title: "第一摄影助理", english: "1st Assistant Camera", desc: "熟悉现场机位协同、跟焦逻辑与拍摄节奏，能稳定支撑复杂拍摄流程。", items: ["机型工作流衔接", "镜头与焦点管理", "现场节奏协同"] },
  { title: "数字影像工程师", english: "Digital Imaging Technician", desc: "关注素材安全、画面监看与现场色彩一致性，帮助拍摄和后期更顺畅对接。", items: ["素材备份与校验", "监看链路管理", "基础 LUT 与画面统一"] },
];

export default function Expertise() {
  return (
    <SectionMotion start="top 80%">
      <section className="expertise" id="expertise">
        <div className="container">
          <p data-motion="title" className="motion-display-title">WORKING METHOD</p>
          <h2 data-motion="heading" className="section-title">工作方式</h2>
          <p data-motion="copy" className="section-subtitle expertise-subtitle">
            把摄影、灯光、现场协作与数字影像流程整合成一套可执行、可协作、也能保持画面判断的工作方法。
          </p>
          <div data-motion="cards" className="expertise-grid">
            {expertise.map((item) => (
              <div className="expertise-card-motion" key={item.title}>
                <GlareHover
                  as="article"
                  className="expertise-card"
                  width="100%" height="auto" background="transparent"
                  borderRadius="2px" borderColor="transparent"
                  glareColor="#d7d7d7" glareOpacity={0.11} glareAngle={-32}
                  glareSize={260} transitionDuration={950}
                >
                  <p className="expertise-english">{item.english}</p>
                  <h3 className="expertise-title">{item.title}</h3>
                  <p className="expertise-desc">{item.desc}</p>
                  <ul className="expertise-list">{item.items.map((entry) => <li key={entry}>{entry}</li>)}</ul>
                </GlareHover>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SectionMotion>
  );
}
