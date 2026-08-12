import "./Hero.css";
import TextReveal from "../components/TextReveal";

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-shell">
        <video
          className="hero-video"
          src="/projects/showreel.mp4"
          poster="/hero-showreel-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="hero-bg-layer" />
        <div className="hero-noise" />
        <div className="hero-light" />

        <div className="hero-meta-left">
          <p className="hero-eyebrow">
            <TextReveal
              text="State before statement."
              animateOn="view"
              sequential={false}
              speed={16}
            />
          </p>
        </div>

        <div className="hero-copy">
          <p className="hero-kicker">
            <TextReveal text="Fifteen Personal Portfolio" animateOn="view" speed={18} />
          </p>
          <h1 className="hero-title">
            <TextReveal text={"\u84b2\u5e08\u6b66"} animateOn="view" speed={16} />
          </h1>
          <p className="hero-name-en">
            <TextReveal text="fifteen" animateOn="view" sequential={false} speed={16} />
          </p>
          <div className="hero-role-block">
            <p className="hero-role-zh">
              <TextReveal
                text={"\u6444\u5f71\u3001\u706f\u5149\u3001\u638c\u673a\u3001\u7b2c\u4e00\u6444\u5f71\u52a9\u7406\u3001\u6570\u5b57\u5f71\u50cf\u5de5\u7a0b\u5e08"}
                animateOn="view"
                speed={14}
              />
            </p>
            <p className="hero-role-en">
              <TextReveal
                text="Cinematography, Gaffer, Camera Operator, 1st Assistant Camera, Digital Imaging Technician"
                animateOn="view"
                sequential={false}
                speed={14}
              />
            </p>
          </div>
        </div>

        <div className="hero-meta-right">
          <p className="hero-statement">
            <TextReveal
              text={"\u5f53\u4e0b\u7684\u72b6\u6001\uff0c\u5148\u4e8e\u9648\u8ff0\u3002\u72b6\u6001\u4e00\u65e6\u7cbe\u51c6\uff0c\u6545\u4e8b\u4fbf\u81ea\u7531\u5ef6\u5c55\u3002"}
              animateOn="view"
              speed={12}
            />
          </p>
        </div>
      </div>
    </section>
  );
}
