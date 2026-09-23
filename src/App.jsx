import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cover from './components/Cover/Cover';
import MainContent from './components/MainContent/MainContent';
import Navigation from './components/Navigation/Navigation';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import styles from './App.module.css';

function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [isCoverDismissed, setIsCoverDismissed] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const appContainerRef = useRef(null);

  useLayoutEffect(() => {
    if (isCoverDismissed && window.innerWidth < 1024 && appContainerRef.current) {
      appContainerRef.current.scrollTop = 0;
    }
  }, [isCoverDismissed]);

  const handleOpen = () => {
    setIsOpened(true);
    setTimeout(() => {
      if (window.innerWidth < 1024) {
        const rightPanel = document.getElementById('mainContentContainer');
        if (rightPanel) {
          rightPanel.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
    setTimeout(() => setIsCoverDismissed(true), 1000);
    // Auto play audio if possible, AudioPlayer will handle it
  };

  return (
    <div ref={appContainerRef} className={`${styles.appContainer} ${isOpened ? styles.appOpened : ''}`}>
      <div className={`${styles.leftPanel} ${isOpened ? styles.opened : ''} ${isCoverDismissed ? styles.dismissed : ''}`}>
        <Cover isOpened={isOpened} onOpen={handleOpen} />
      </div>

      <div id="mainContentContainer" className={`${styles.rightPanel} ${isOpened ? styles.active : ''}`}>
        {isOpened && <MainContent setActiveSection={setActiveSection} />}
      </div>

      <AnimatePresence>
        {isOpened && (
          <motion.div
            className={styles.fixedControls}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <AudioPlayer />
            <Navigation activeSection={activeSection} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
