import TextReveal from "../components/TextReveal";
import "./Contact.css";

const methods = [
  { label: "\u7535\u8bdd", value: "15886690296", href: "tel:15886690296" },
  { label: "\u90ae\u7bb1", value: "2493627661@qq.com", href: "mailto:2493627661@qq.com" },
  { label: "\u5fae\u4fe1", value: "17674570906", href: "#" },
];

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-panel">
        <p className="contact-label">
          <TextReveal text="Contact" animateOn="view" speed={18} />
        </p>
        <h2 className="contact-title">
          <TextReveal
            text={"\u6b22\u8fce\u77ed\u7247\u3001\u5e7f\u544a\u4e0e\u4eba\u7269\u5f71\u50cf\u5408\u4f5c"}
            animateOn="view"
            speed={16}
          />
        </h2>
        <p className="contact-subtitle">
          <TextReveal
            text={"\u5982\u679c\u4f60\u6b63\u5728\u5bfb\u627e\u517c\u987e\u753b\u9762\u6c14\u8d28\u4e0e\u73b0\u573a\u6267\u884c\u6548\u7387\u7684\u5408\u4f5c\u5bf9\u8c61\uff0c\u6211\u4eec\u53ef\u4ee5\u804a\u804a\u9879\u76ee\u672c\u8eab\u3002"}
            animateOn="view"
            speed={10}
          />
        </p>

        <div className="contact-methods">
          {methods.map((item) => (
            <a className="contact-method" href={item.href} key={item.label}>
              <span className="contact-method-label">
                <TextReveal text={item.label} animateOn="view" speed={16} />
              </span>
              <span className="contact-method-value">
                <TextReveal
                  text={item.value}
                  animateOn="view"
                  sequential={false}
                  speed={14}
                />
              </span>
            </a>
          ))}
        </div>

        <p className="contact-footer">
          <TextReveal
            text="Fifteen Pu Personal Portfolio | Updated July 30, 2026"
            animateOn="view"
            sequential={false}
            speed={16}
          />
        </p>
      </div>
    </section>
  );
}
