import "./Expertise.css";
import GlareHover from "../components/GlareHover";
import TextReveal from "../components/TextReveal";

const expertise = [
  {
    title: "\u6444\u5f71\u6307\u5bfc",
    english: "Director of Photography",
    desc: "\u5c06\u6587\u672c\u8282\u594f\u8f6c\u8bd1\u4e3a\u753b\u9762\u8282\u594f\uff0c\u5efa\u7acb\u955c\u5934\u8bed\u8a00\u3001\u573a\u666f\u5173\u7cfb\u4e0e\u60c5\u7eea\u8d70\u5411\u3002",
    items: [
      "\u955c\u5934\u8bbe\u8ba1\u4e0e\u573a\u9762\u8c03\u5ea6",
      "\u81ea\u7136\u4e3b\u4e49\u53d9\u4e8b\u5f71\u8c03",
      "\u591c\u620f\u4e0e\u4f4e\u7167\u5ea6\u65b9\u6848",
    ],
  },
  {
    title: "\u706f\u5149\u5e08",
    english: "Gaffer",
    desc: "\u5728\u6709\u9650\u9884\u7b97\u548c\u573a\u5730\u6761\u4ef6\u4e0b\uff0c\u5feb\u901f\u7ec4\u7ec7\u706f\u5149\u7ed3\u6784\uff0c\u517c\u987e\u6548\u7387\u4e0e\u8d28\u611f\u3002",
    items: [
      "\u81ea\u7136\u5149\u5851\u5f62",
      "\u5c0f\u4f53\u91cf\u5e03\u5149\u6267\u884c",
      "\u5149\u6bd4\u4e0e\u5c42\u6b21\u63a7\u5236",
    ],
  },
  {
    title: "\u7b2c\u4e00\u6444\u5f71\u52a9\u7406",
    english: "1st Assistant Camera",
    desc: "\u719f\u6089\u73b0\u573a\u673a\u4f4d\u534f\u540c\u3001\u8ddf\u7126\u903b\u8f91\u4e0e\u62cd\u6444\u8282\u594f\uff0c\u80fd\u7a33\u5b9a\u652f\u6491\u590d\u6742\u62cd\u6444\u6d41\u7a0b\u3002",
    items: [
      "\u673a\u578b\u5de5\u4f5c\u6d41\u8854\u63a5",
      "\u955c\u5934\u4e0e\u7126\u70b9\u7ba1\u7406",
      "\u73b0\u573a\u8282\u594f\u534f\u540c",
    ],
  },
  {
    title: "\u6570\u5b57\u5f71\u50cf\u5de5\u7a0b\u5e08",
    english: "Digital Imaging Technician",
    desc: "\u5173\u6ce8\u7d20\u6750\u5b89\u5168\u3001\u753b\u9762\u76d1\u770b\u4e0e\u73b0\u573a\u8272\u5f69\u4e00\u81f4\u6027\uff0c\u5e2e\u52a9\u62cd\u6444\u548c\u540e\u671f\u66f4\u987a\u7545\u5bf9\u63a5\u3002",
    items: [
      "\u7d20\u6750\u5907\u4efd\u4e0e\u6821\u9a8c",
      "\u76d1\u770b\u94fe\u8def\u7ba1\u7406",
      "\u57fa\u7840 LUT \u4e0e\u753b\u9762\u7edf\u4e00",
    ],
  },
];

export default function Expertise() {
  return (
    <section className="expertise" id="expertise">
      <div className="container">
        <p className="section-label">
          <TextReveal text="Working Method" animateOn="view" speed={18} />
        </p>
        <h2 className="section-title">
          <TextReveal text={"\u5de5\u4f5c\u65b9\u5f0f"} animateOn="view" speed={16} />
        </h2>
        <p className="section-subtitle expertise-subtitle">
          <TextReveal
            text={"\u628a\u6444\u5f71\u3001\u706f\u5149\u3001\u73b0\u573a\u534f\u4f5c\u4e0e\u6570\u5b57\u5f71\u50cf\u6d41\u7a0b\u6574\u5408\u6210\u4e00\u5957\u53ef\u6267\u884c\u3001\u53ef\u534f\u4f5c\u3001\u4e5f\u80fd\u4fdd\u6301\u753b\u9762\u5224\u65ad\u7684\u5de5\u4f5c\u65b9\u6cd5\u3002"}
            animateOn="view"
            speed={10}
          />
        </p>
        <div className="expertise-grid">
          {expertise.map((item) => (
            <GlareHover
              as="article"
              className="expertise-card"
              key={item.title}
              width="100%"
              height="auto"
              background="transparent"
              borderRadius="2px"
              borderColor="transparent"
              glareColor="#d7d7d7"
              glareOpacity={0.11}
              glareAngle={-32}
              glareSize={260}
              transitionDuration={950}
            >
              <p className="expertise-english">
                <TextReveal text={item.english} animateOn="view" sequential={false} speed={14} />
              </p>
              <h3 className="expertise-title">
                <TextReveal text={item.title} animateOn="view" speed={14} />
              </h3>
              <p className="expertise-desc">
                <TextReveal text={item.desc} animateOn="view" speed={10} />
              </p>
              <ul className="expertise-list">
                {item.items.map((entry) => (
                  <li key={entry}>
                    <TextReveal text={entry} animateOn="view" speed={10} />
                  </li>
                ))}
              </ul>
            </GlareHover>
          ))}
        </div>
      </div>
    </section>
  );
}
