import { useState } from 'react';
import Nav from './components/Nav';
import LiquidEther from './components/LiquidEther';
import IntroOverlay from './components/IntroOverlay';
import SectionReveal from './components/SectionReveal';
import Hero from './sections/Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Expertise from './sections/Expertise';
import Resume from './sections/Resume';
import Contact from './sections/Contact';
import './styles/global.css';

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {!introComplete && <IntroOverlay onComplete={() => setIntroComplete(true)} />}
      <div className="site-dither" aria-hidden="true">
        <div style={{ width: "1080px", height: "1080px", position: "relative" }}>
          <LiquidEther
            mouseForce={10}
            cursorSize={110}
            isViscous
            viscous={40}
            colors={["#1A1A1A", "#333333", "#4D4D4D", "#666666", "#808080"]}
            autoDemo
            autoSpeed={0.7}
            autoIntensity={2.9}
            isBounce
            resolution={0.5}
          />
        </div>
      </div>
      {introComplete && (
        <>
          <Nav />
          <main className="site-main">
            <SectionReveal variant="hero" immediate>
              <Hero />
            </SectionReveal>
            <SectionReveal variant="rise">
              <About />
            </SectionReveal>
            <SectionReveal variant="wipe">
              <Projects />
            </SectionReveal>
            <SectionReveal variant="settle">
              <Expertise />
            </SectionReveal>
            <SectionReveal variant="rise">
              <Resume />
            </SectionReveal>
            <Contact />
          </main>
        </>
      )}
    </>
  );
}

export default App;
