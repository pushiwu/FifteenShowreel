import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./DitWorkflow.css";

const workflowStages = [
  {
    number: "01",
    eyebrow: "ON SET",
    title: "现场采集与安全",
    titleEn: "Ingest, Verify, Monitor",
    steps: [
      { code: "INGEST", title: "素材安全", detail: "卡片卸载、音视频对应、原始素材保留。" },
      { code: "CHECK", title: "数据校验", detail: "容量核对、校验日志、回放检查与原卡释放确认。" },
      { code: "LIVE", title: "现场监看", detail: "Live Grade、监看链路和摄影师画面判断协同。" },
    ],
  },
  {
    number: "02",
    eyebrow: "EDITORIAL HANDOFF",
    title: "后期交接",
    titleEn: "Organize, Transcode, Relink",
    steps: [
      { code: "SORT", title: "素材整理", detail: "按项目、日期、机位、卡号和场次建立可追溯结构。" },
      { code: "PROXY", title: "代理规格", detail: "生成代理、时间码和必要的画面标识，确保剪辑可直接接手。" },
      { code: "HANDOFF", title: "工程交接", detail: "DIT 报告、场记单、XML / AAF 与剪辑工程一并归档。" },
    ],
  },
  {
    number: "03",
    eyebrow: "FINISHING",
    title: "完成与交付",
    titleEn: "Grade, Master, Deliver",
    steps: [
      { code: "COLOR", title: "色彩管理", detail: "区分摄影机 Log、现场 Viewing LUT 与最终调色链路。" },
      { code: "MASTER", title: "母版制作", detail: "调色工程、渲染、混音与版本状态统一管理。" },
      { code: "QC", title: "最终质检", detail: "画面、音频、帧率、字幕、DCP 和交付文件逐项确认。" },
      { code: "RESTORE", title: "恢复测试", detail: "3+2+1 备份之外，抽样恢复并验证副本真实可用。" },
    ],
  },
];

export default function DitWorkflow() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeydown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="dit-workflow-trigger"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span>查看工作流</span>
        <span className="dit-workflow-trigger-en">View workflow</span>
        <span className="dit-workflow-trigger-arrow" aria-hidden="true">→</span>
      </button>

      {isOpen ? createPortal(
        <div
          className="dit-workflow-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dit-workflow-title"
          onClick={() => setIsOpen(false)}
        >
          <div className="dit-workflow-panel" onClick={(event) => event.stopPropagation()}>
            <header className="dit-workflow-header">
              <div>
                <p className="dit-workflow-kicker">DIGITAL IMAGING TECHNICIAN / 数字影像工程师</p>
                <h2 id="dit-workflow-title">从现场到母版</h2>
                <p className="dit-workflow-intro">
                  一套可校验、可交接、可恢复的影像数据工作流。
                  <span>A traceable image pipeline from set to master.</span>
                </p>
              </div>
              <div className="dit-workflow-actions">
                <a href="/DIT工作流一览.pdf" target="_blank" rel="noreferrer">
                  PDF / 完整图
                </a>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="关闭工作流">
                  <span aria-hidden="true">×</span>
                  <span>Close</span>
                </button>
              </div>
            </header>

            <div className="workflow-timeline">
              {workflowStages.map((stage) => (
                <section className="workflow-stage" key={stage.number}>
                  <div className="workflow-stage-heading">
                    <span className="workflow-stage-number">{stage.number}</span>
                    <div>
                      <p>{stage.eyebrow}</p>
                      <h3>{stage.title}</h3>
                      <span>{stage.titleEn}</span>
                    </div>
                  </div>
                  <div className="workflow-stage-line" aria-hidden="true" />
                  <div className="workflow-steps">
                    {stage.steps.map((step) => (
                      <article className="workflow-step" key={step.code}>
                        <span className="workflow-step-code">{step.code}</span>
                        <h4>{step.title}</h4>
                        <p>{step.detail}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
