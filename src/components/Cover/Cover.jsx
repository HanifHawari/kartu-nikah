import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelopeOpen } from 'react-icons/fa';
import styles from './Cover.module.css';

const Cover = ({ isOpened, onOpen }) => {
  return (
    <div className={`${styles.coverWrapper} ${isOpened ? styles.opened : ''}`}>
      {/* Background Media */}
      <img src="/cover-bg.jpg" className={styles.bgMedia} alt="Background" />
      
      {/* Overlay for readability */}
      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <p className={styles.subtitle}>THE WEDDING OF</p>
          <h1 className={styles.title}>Hanief & Elsa</h1>
        </motion.div>

        {!isOpened && (
          <motion.div 
            className={styles.guestInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <p className={styles.to}>Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <h2 className={styles.guestName}>KAMARUDIN</h2>
            <button className={styles.openBtn} onClick={onOpen}>
              <FaEnvelopeOpen className={styles.icon} /> Buka Undangan
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Cover;
