import { lazy, Suspense, useCallback, useState } from 'react';
import Nav from './components/Nav';
import LiquidEther from './components/LiquidEther';
import IntroOverlay from './components/IntroOverlay';
import SectionReveal from './components/SectionReveal';
import Hero from './sections/Hero';
import About from './sections/About';
import './styles/global.css';

const Projects = lazy(() => import('./sections/Projects'));
const Expertise = lazy(() => import('./sections/Expertise'));
const Resume = lazy(() => import('./sections/Resume'));
const Contact = lazy(() => import('./sections/Contact'));

function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [heroHandoff, setHeroHandoff] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const handleHeroHandoff = useCallback(() => setHeroHandoff(true), []);

  return (
    <>
      {!introComplete && (
        <IntroOverlay
          onHandoffStart={handleHeroHandoff}
          onComplete={handleIntroComplete}
        />
      )}
      {heroHandoff ? (
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
      ) : null}
      <div className="site-content" inert={!introComplete} aria-hidden={!introComplete}>
        <Nav />
        <main className="site-main">
          <SectionReveal immediate>
            <Hero active={heroHandoff} heroHandoff={heroHandoff} />
          </SectionReveal>
          <SectionReveal>
            <About />
          </SectionReveal>
          {introComplete ? (
            <Suspense fallback={null}>
              <SectionReveal>
                <Projects />
              </SectionReveal>
              <SectionReveal>
                <Expertise />
              </SectionReveal>
              <SectionReveal>
                <Resume />
              </SectionReveal>
              <Contact />
            </Suspense>
          ) : null}
        </main>
      </div>
    </>
  );
}

export default App;
