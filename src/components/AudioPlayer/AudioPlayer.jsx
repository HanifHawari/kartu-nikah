import React, { useState } from 'react';
import { FaMusic, FaVolumeMute } from 'react-icons/fa';
import styles from './AudioPlayer.module.css';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`${styles.playerContainer} ${isPlaying ? styles.playing : ''}`} onClick={togglePlay}>
      {isPlaying ? <FaMusic className={styles.musicIcon} /> : <FaVolumeMute className={styles.musicIcon} />}
      {isPlaying && <audio src="/backsound.mp3" autoPlay loop />}
    </div>
  );
};

export default AudioPlayer;
