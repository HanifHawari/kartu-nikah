import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cover from './components/Cover/Cover';
import MainContent from './components/MainContent/MainContent';
import Navigation from './components/Navigation/Navigation';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import styles from './App.module.css';

function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

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
    // Auto play audio if possible, AudioPlayer will handle it
  };

  return (
    <div className={`${styles.appContainer} ${isOpened ? styles.appOpened : ''}`}>
      <div className={`${styles.leftPanel} ${isOpened ? styles.opened : ''}`}>
        <Cover isOpened={isOpened} onOpen={handleOpen} />
        
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

      <div id="mainContentContainer" className={`${styles.rightPanel} ${isOpened ? styles.active : ''}`}>
        {isOpened && <MainContent setActiveSection={setActiveSection} />}
      </div>
    </div>
  );
}

export default App;
