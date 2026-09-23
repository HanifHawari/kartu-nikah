import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import {
  FaCalendarAlt,
  FaCopy,
  FaDownload,
  FaGift,
  FaInstagram,
  FaMapMarkerAlt,
  FaTiktok,
  FaWhatsapp,
  FaYoutube
} from 'react-icons/fa';
import { GiDiamondRing, GiWineGlass } from 'react-icons/gi';
import Reveal from '../ui/Reveal';
import styles from './MainContent.module.css';

const COUPLE_BACKGROUNDS = ['/hero.jpg', '/galeri-3.jpg', '/galeri-6.jpg', '/galeri-8.jpg'];
const EVENT_BACKGROUNDS = ['/hero.jpg', '/galeri-1.jpg', '/galeri-2.jpg', '/galeri-4.jpg'];
const WEDDING_DATE = new Date('2026-09-24T00:00:00+07:00').getTime();
const RSVP_STORAGE_KEY = 'Hanief-Elsa-rsvp';
const WISHES_STORAGE_KEY = 'Hanief-Elsa-wishes';

const readLocalEntries = (storageKey) => {
  if (typeof window === 'undefined') return [];

  try {
    const entries = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
};

const saveLocalEntries = (storageKey, entries) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
};

const formatWishTime = (createdAt) => {
  const createdTime = new Date(createdAt).getTime();
  if (!Number.isFinite(createdTime)) return 'Baru saja';

  const elapsedMinutes = Math.max(Math.floor((Date.now() - createdTime) / 60000), 0);
  if (elapsedMinutes < 1) return 'Baru saja';
  if (elapsedMinutes < 60) return `${elapsedMinutes} menit lalu`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} jam lalu`;

  return new Date(createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getCountdown = () => {
  const distance = Math.max(WEDDING_DATE - Date.now(), 0);

  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60)
  };
};

const AnimatedCounter = ({ value }) => {
  const counterRef = useRef(null);
  const hasAnimated = useRef(false);
  const isAnimating = useRef(false);
  const latestValue = useRef(value);
  const isInView = useInView(counterRef, { once: true, amount: 0.7 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;

    hasAnimated.current = true;
    isAnimating.current = true;
    const targetValue = latestValue.current;
    const duration = 1200;
    const startTime = performance.now();
    let frameId;

    const updateCounter = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(targetValue * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(updateCounter);
      } else {
        isAnimating.current = false;
        setDisplayValue(latestValue.current);
      }
    };

    frameId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(frameId);
  }, [isInView]);

  useEffect(() => {
    latestValue.current = value;
    if (hasAnimated.current && !isAnimating.current) {
      setDisplayValue(value);
    }
  }, [value]);

  return <span ref={counterRef}>{String(displayValue).padStart(2, '0')}</span>;
};

const BackgroundSlideshow = ({ images }) => {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [images.length]);

  return (
    <div className={styles.slideshowBackground} aria-hidden="true">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={images[activeImage]}
          className={styles.slideshowImage}
          style={{ backgroundImage: `url(${images[activeImage]})` }}
          initial={{ opacity: 0, filter: 'blur(18px)', scale: 1.08 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, filter: 'blur(16px)', scale: 1.05 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
      </AnimatePresence>
      <div className={styles.slideshowOverlay}></div>
    </div>
  );
};

const MainContent = ({ setActiveSection }) => {
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState('');
  const [countdown, setCountdown] = useState(getCountdown);
  const [savedWishes, setSavedWishes] = useState(() => (
    readLocalEntries(WISHES_STORAGE_KEY).filter((wish) => (
      wish
      && typeof wish.name === 'string'
      && wish.name.trim()
      && typeof wish.message === 'string'
      && wish.message.trim()
    ))
  ));
  const [rsvpFeedback, setRsvpFeedback] = useState('');
  const [wishFeedback, setWishFeedback] = useState('');

  const handleCopy = async (value, label) => {
    if (!navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedItem(label);
      window.setTimeout(() => setCopiedItem(''), 1800);
    } catch {
      setCopiedItem('');
    }
  };

  const handleGiftConfirmation = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = [
      'Konfirmasi pengiriman hadiah',
      `Nama: ${formData.get('name')}`,
      `Nominal/Kado: ${formData.get('gift')}`,
      `Tujuan: ${formData.get('destination')}`
    ].join('\n');

    window.open(`https://wa.me/6282373307862?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleSaveDate = () => {
    const calendarContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hanief & Elsa//Wedding Invitation//ID',
      'BEGIN:VEVENT',
      'UID:Hanief-Elsa-wedding-20260924',
      'DTSTART;VALUE=DATE:20260924',
      'DTEND;VALUE=DATE:20260925',
      'SUMMARY:Pernikahan Hanief & Elsa',
      'LOCATION:Jl. Bakungan, Wedomartani, Yogyakarta.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const downloadUrl = URL.createObjectURL(new Blob([calendarContent], { type: 'text/calendar' }));
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = 'pernikahan-hanief-elsa.ics';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleRsvpSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const submission = {
      id: Date.now(),
      name: String(formData.get('name')).trim(),
      guests: Number(formData.get('guests')),
      attendance: String(formData.get('attendance')),
      createdAt: new Date().toISOString()
    };
    const storedEntries = readLocalEntries(RSVP_STORAGE_KEY);

    if (
      !submission.name
      || !Number.isInteger(submission.guests)
      || submission.guests < 1
      || !['Hadir', 'Tidak'].includes(submission.attendance)
    ) {
      setRsvpFeedback('Lengkapi data RSVP dengan benar sebelum dikirim.');
      return;
    }

    if (saveLocalEntries(RSVP_STORAGE_KEY, [...storedEntries, submission])) {
      setRsvpFeedback('Konfirmasi kehadiran berhasil disimpan di perangkat ini.');
      form.reset();
      setRsvpStatus('');
    } else {
      setRsvpFeedback('Konfirmasi tidak dapat disimpan. Periksa izin penyimpanan browser.');
    }
  };

  const handleWishSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name')).trim();
    const message = String(formData.get('message')).trim();
    const newWish = {
      id: Date.now(),
      name,
      message,
      createdAt: new Date().toISOString()
    };
    const nextWishes = [newWish, ...savedWishes];

    if (!name || !message) {
      setWishFeedback('Nama dan ucapan tidak boleh kosong.');
      return;
    }

    if (saveLocalEntries(WISHES_STORAGE_KEY, nextWishes)) {
      setSavedWishes(nextWishes);
      setWishFeedback('Ucapan berhasil disimpan.');
      form.reset();
    } else {
      setWishFeedback('Ucapan tidak dapat disimpan. Periksa izin penyimpanan browser.');
    }
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    Fancybox.bind('[data-fancybox="gallery"]', {
      Infinite: true,
      Thumbs: { autoStart: true },
      Toolbar: {
        display: { left: ['infobar'], middle: [], right: ['slideshow', 'thumbs', 'close'] }
      }
    });
    return () => Fancybox.unbind('[data-fancybox="gallery"]');
  }, []);

  useEffect(() => {
    if (!setActiveSection) return;
    
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, {
      rootMargin: '-40% 0px -60% 0px'
    });

    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, [setActiveSection]);

  return (
    <div className={styles.mainContainer}>
      
      {/* 1. Hero Section (Solid or Parallax) */}
      <section id="hero" className={`${styles.section} ${styles.heroSection}`}>
        <Reveal direction="up">
          <img src="/hero.jpg" className={styles.heroImagePlaceholder} alt="Hero" />
          <p className={styles.heroSubtitle}>THE WEDDING OF</p>
          <h1 className={styles.heroTitle}>Hanief & Elsa</h1>
          <p className={styles.heroDate}>24 . 09 . 2026</p>
        </Reveal>
      </section>

      {/* 2. Quote Section (Solid) */}
      <section className={`${styles.section} ${styles.solidSection}`}>
        <Reveal direction="up">
          <div className={styles.quoteIcon}>"</div>
          <p className={styles.quoteText}>
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir."
          </p>
          <p className={styles.quoteSource}>(Q.S. Ar-Rum: 21)</p>
        </Reveal>
      </section>

      {/* 3. Couple Profile (Solid) */}
      <section id="couple" className={`${styles.section} ${styles.solidSection} ${styles.coupleSection}`}>
        <BackgroundSlideshow images={COUPLE_BACKGROUNDS} />
        <Reveal direction="up">
          <h2 className={styles.sectionTitle}>Wedding Couple</h2>
          <p className={styles.sectionDesc}>Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala, insyaAllah kami akan menyelenggarakan acara pernikahan kami:</p>
        </Reveal>
        
        <Reveal direction="left">
          <div className={`${styles.coupleProfile} ${styles.coupleProfileTop}`}>
            <img src="/profil-wanita.jpg" className={styles.profileImagePlaceholder} alt="Putri" />
            <h3 className={styles.profileName}>Elsa</h3>
            <p className={styles.profileDesc}>Putri Pertama dari<br/>Bapak Lorem Ipsum & Ibu Lorem Ipsum</p>
            <a
              href="https://www.instagram.com/elsadaimanik"
              className={styles.instagramLink}
              target="_blank"
              rel="noreferrer"
              title="Kunjungi Instagram Elsa"
            >
              <FaInstagram /> @elsadaimanik
            </a>
          </div>
        </Reveal>

        <Reveal direction="up">
          <div className={styles.ampersand}>&</div>
        </Reveal>

        <Reveal direction="right">
          <div className={`${styles.coupleProfile} ${styles.coupleProfileBottom}`}>
            <img src="/profil-pria.jpg" className={styles.profileImagePlaceholder} alt="Putra" />
            <h3 className={styles.profileName}>Hanief</h3>
            <p className={styles.profileDesc}>Putra Pertama dari<br/>Bapak Lorem Ipsum & Ibu Lorem Ipsum</p>
            <a
              href="https://www.instagram.com/haniefhawari"
              className={styles.instagramLink}
              target="_blank"
              rel="noreferrer"
              title="Kunjungi Instagram Hanief"
            >
              <FaInstagram /> @haniefhawari
            </a>
          </div>
        </Reveal>
      </section>

      {/* 4. Countdown (Solid) */}
      <section className={`${styles.section} ${styles.solidSection} ${styles.countdownSection}`}>
        <Reveal direction="up">
          <h2 className={styles.countdownTitle}>Menuju Hari Bahagia</h2>
          <div className={styles.timerGrid}>
            <div className={styles.timeBox}><AnimatedCounter value={countdown.days} />Hari</div>
            <div className={styles.timeBox}><AnimatedCounter value={countdown.hours} />Jam</div>
            <div className={styles.timeBox}><AnimatedCounter value={countdown.minutes} />Menit</div>
            <div className={styles.timeBox}><AnimatedCounter value={countdown.seconds} />Detik</div>
          </div>
          <button type="button" className={styles.calendarBtn} onClick={handleSaveDate} title="Unduh acara ke kalender">
            <FaDownload /> Simpan Tanggal
          </button>
        </Reveal>
      </section>

      {/* 5. Events (Parallax 1) */}
      <section id="events" className={`${styles.section} ${styles.parallaxSection} ${styles.eventSection}`}>
        <BackgroundSlideshow images={EVENT_BACKGROUNDS} />
        <Reveal direction="left">
          <div className={`${styles.eventCard} ${styles.eventCardTop}`}>
            <GiDiamondRing className={styles.eventIcon} aria-hidden="true" />
            <h3>Akad Nikah</h3>
            <div className={styles.eventDivider} aria-hidden="true"></div>
            <div className={styles.dateBox}>
              <FaCalendarAlt aria-hidden="true" />
              <span>Minggu</span>
              <strong><AnimatedCounter value={23} /></strong>
              <span>September 2026</span>
            </div>
            <p>07.00 WIB - Selesai</p>
            <p className={styles.location}>Bertempat Di:<br/>Kediaman Mempelai Wanita<br/>Jl. Bakungan, Wedomartani, Yogyakarta.</p>
            <a
              href="https://maps.app.goo.gl/aCQrEHgPEkgz7w8o9?g_st=ic"
              className={styles.mapBtn}
              target="_blank"
              rel="noreferrer"
              title="Buka lokasi di Google Maps"
            >
              <FaMapMarkerAlt /> Lihat Lokasi
            </a>
          </div>
        </Reveal>

        <Reveal direction="right">
          <div className={`${styles.eventCard} ${styles.eventCardBottom}`}>
            <GiWineGlass className={styles.eventIcon} aria-hidden="true" />
            <h3>Resepsi</h3>
            <div className={styles.eventDivider} aria-hidden="true"></div>
            <div className={styles.dateBox}>
              <FaCalendarAlt aria-hidden="true" />
              <span>Minggu</span>
              <strong><AnimatedCounter value={23} /></strong>
              <span>September 2026</span>
            </div>
            <p>09.00 WIB - Selesai</p>
            <p className={styles.location}>Bertempat Di:<br/>Kediaman Mempelai Wanita<br/>Jl. Bakungan, Wedomartani, Yogyakarta.</p>
            <a
              href="https://maps.app.goo.gl/aCQrEHgPEkgz7w8o9?g_st=ic"
              className={styles.mapBtn}
              target="_blank"
              rel="noreferrer"
              title="Buka lokasi di Google Maps"
            >
              <FaMapMarkerAlt /> Lihat Lokasi
            </a>
          </div>
        </Reveal>
      </section>

      {/* 6. Live Streaming (Solid) */}
      <section className={`${styles.section} ${styles.solidSection}`}>
        <Reveal direction="up">
          <h2 className={styles.sectionTitle}>Live Streaming</h2>
          <p className={styles.sectionDesc}>Bagi tamu undangan yang berhalangan hadir dan ingin menyaksikan acara pernikahan kami silahkan ikuti live streaming acara pernikahan kami dengan klik tombol di bawah:</p>
          <div className={styles.streamLinks}>
            <a href="https://www.instagram.com/haniefhawari" className={styles.streamBtn} target="_blank" rel="noreferrer" title="Kunjungi Instagram">
              <FaInstagram /> Instagram Live
            </a>
            <a href="https://www.tiktok.com/@bangnepsz12?_r=1&_t=ZS-99xo36n1B3c" className={styles.streamBtn} target="_blank" rel="noreferrer" title="Kunjungi TikTok">
              <FaTiktok /> Tiktok Live
            </a>
            <a href="https://youtube.com/@tiaraandiniofficial?si=O3Uu4OFCQNRJxaCI" className={styles.streamBtn} target="_blank" rel="noreferrer" title="Kunjungi YouTube">
              <FaYoutube /> Youtube Live
            </a>
          </div>
        </Reveal>
      </section>

      {/* 7. Gallery */}
      <section id="gallery" className={`${styles.section} ${styles.gallerySection}`}>
        <Reveal direction="up">
          <p className={styles.galleryEyebrow}>Our</p>
          <h2 className={`${styles.sectionTitle} ${styles.galleryTitle}`}>Gallery</h2>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <div className={styles.galleryVideoFrame}>
            <video src="/background-vid.mp4" autoPlay loop muted playsInline className={styles.galleryVideo} />
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <div className={styles.galleryMosaic}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <a
                key={i}
                href={`/galeri-${i}.jpg`}
                data-fancybox="gallery"
                data-caption={`Galeri ${i}`}
                className={styles.galleryItemWrapper}
              >
                <img
                  src={`/galeri-${i}.jpg`}
                  className={styles.galleryItem}
                  alt={`Gallery ${i}`}
                />
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 8. Love Story (Solid) */}
      <section className={`${styles.section} ${styles.solidSection}`}>
        <Reveal direction="up">
          <h2 className={styles.sectionTitle}>Our Love Story</h2>
        </Reveal>
        <div className={styles.timeline}>
          <Reveal direction="left">
            <div className={styles.timelineItem}>
              <div className={styles.timelineDate}>Maret 2021</div>
              <h4>Awal Bertemu</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </Reveal>
          <Reveal direction="right">
            <div className={styles.timelineItem}>
              <div className={styles.timelineDate}>April 2022</div>
              <h4>Awal Hubungan</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </Reveal>
          <Reveal direction="left">
            <div className={styles.timelineItem}>
              <div className={styles.timelineDate}>Januari 2023</div>
              <h4>Lamaran</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </Reveal>
          <Reveal direction="right">
            <div className={styles.timelineItem}>
              <div className={styles.timelineDate}>September 2024</div>
              <h4>Menikah</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 9. Gift (Parallax) */}
      <section id="gift" className={`${styles.section} ${styles.parallaxSection} ${styles.giftSection}`}>
        <Reveal direction="up">
          <h2 className={styles.sectionTitle}>Kirim Hadiah</h2>
          <p className={styles.sectionDesc}>Doa Restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.</p>
        </Reveal>

        <AnimatePresence mode="wait">
          {!isGiftOpen ? (
            <motion.div
              key="gift-trigger"
              className={styles.giftIntroCard}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <motion.div
                className={styles.giftIconWrap}
                animate={{ y: [0, 0, -18, 0, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.3, 0.48, 0.68, 1], ease: 'easeInOut' }}
              >
                <div className={styles.giftBoxIllustration} aria-hidden="true">
                  <motion.div
                    className={styles.giftLid}
                    animate={{ y: [0, 0, -14, -12, 0], x: [0, 0, 5, 5, 0], rotate: [0, 0, 9, 9, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.3, 0.5, 0.68, 0.88], ease: 'easeInOut' }}
                  />
                  <div className={styles.giftBoxBody}></div>
                </div>
              </motion.div>
              <p>Hadiah kecil Anda akan menjadi kenangan yang berarti bagi kami.</p>
              <motion.button
                type="button"
                className={styles.openGiftBtn}
                onClick={() => setIsGiftOpen(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaGift aria-hidden="true" /> Kirim Hadiah
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="gift-details"
              className={styles.giftDetails}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <div className={styles.giftAccount}>
                <div>
                  <p className={styles.bankOwner}>Elsa</p>
                  <p className={styles.bankAccount}>1234567890</p>
                </div>
                <div className={`${styles.bankLogo} ${styles.bcaLogo}`}>BCA</div>
              </div>
              <button type="button" className={styles.copyBtn} onClick={() => handleCopy('1234567890', 'bca')}>
                <FaCopy /> {copiedItem === 'bca' ? 'Berhasil Disalin' : 'Copy No.Rek'}
              </button>

              <div className={styles.giftAccount}>
                <div>
                  <p className={styles.bankOwner}>Hanief Hawari</p>
                  <p className={styles.bankAccount}>0987654321</p>
                </div>
                <div className={`${styles.bankLogo} ${styles.mandiriLogo}`}>mandiri</div>
              </div>
              <button type="button" className={styles.copyBtn} onClick={() => handleCopy('0987654321', 'mandiri')}>
                <FaCopy /> {copiedItem === 'mandiri' ? 'Berhasil Disalin' : 'Copy No.Rek'}
              </button>

              <div className={styles.physicalGift}>
                <FaGift aria-hidden="true" />
                <p>Anda juga bisa mengirim kado fisik ke alamat berikut:</p>
                <strong>Jl. Bakungan, Wedomartani, Yogyakarta.</strong>
              </div>
              <button type="button" className={styles.copyBtn} onClick={() => handleCopy('Jl. Bakungan, Wedomartani, Yogyakarta.', 'address')}>
                <FaCopy /> {copiedItem === 'address' ? 'Berhasil Disalin' : 'Copy Alamat'}
              </button>

              <form className={styles.giftForm} onSubmit={handleGiftConfirmation}>
                <h3>Konfirmasi Pengiriman Hadiah:</h3>
                <label htmlFor="gift-name">Nama</label>
                <input id="gift-name" name="name" type="text" placeholder="Nama Tamu" required />
                <label htmlFor="gift-value">Nominal/Kado</label>
                <input id="gift-value" name="gift" type="text" placeholder="Nominal/Kado" required />
                <label htmlFor="gift-destination">Rekening/Alamat Tujuan</label>
                <select id="gift-destination" name="destination" defaultValue="" required>
                  <option value="" disabled>Rekening/Alamat Tujuan</option>
                  <option value="BCA - Elsa">BCA - Elsa</option>
                  <option value="Mandiri - Hanief Hawari">Mandiri - Hanief Hawari</option>
                  <option value="Kado fisik">Kado fisik</option>
                </select>
                <button type="submit" className={styles.whatsappBtn} title="Buka WhatsApp untuk mengirim konfirmasi">
                  <FaWhatsapp /> Konfirmasi via WhatsApp
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 10. RSVP (Solid) */}
      <section id="rsvp" className={`${styles.section} ${styles.solidSection}`}>
        <Reveal direction="up">
          <div className={styles.rsvpCard}>
            <img src="/rsvp.jpg" className={styles.rsvpImagePlaceholder} alt="RSVP Cover" />
            <h2 className={styles.sectionTitle}>RSVP</h2>
            <p className={styles.sectionDesc}>*Kepada tamu undangan diharapkan untuk mengisi form kehadiran di bawah ini</p>
            
            <form className={styles.rsvpForm} onSubmit={handleRsvpSubmit}>
              <input name="name" type="text" placeholder="Nama" required />
              <input name="guests" type="number" placeholder="Jumlah" required min="1" />
              <select name="attendance" value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value)} required>
                <option value="" disabled>Konfirmasi</option>
                <option value="Hadir">Saya Akan Datang</option>
                <option value="Tidak">Maaf, Saya Tidak Bisa Datang</option>
              </select>
              <button type="submit" className={styles.submitBtn}>Kirim</button>
              {rsvpFeedback && <p className={styles.formFeedback} role="status">{rsvpFeedback}</p>}
            </form>
          </div>
        </Reveal>
      </section>

      {/* 11. Wishes (Parallax) */}
      <section className={`${styles.section} ${styles.parallaxSection} ${styles.wishesSection}`}>
        <Reveal direction="up">
          <h2 className={styles.sectionTitle}>Ucapan & Doa</h2>
          <p className={styles.sectionDesc}>Kirimkan ucapan dan doa untuk kedua mempelai</p>
          
          <form className={styles.wishesForm} onSubmit={handleWishSubmit}>
            <input name="name" type="text" placeholder="Nama Tamu" required />
            <textarea name="message" placeholder="Tulis ucapan & doa..." rows="4" required></textarea>
            <button type="submit" className={styles.submitBtn}>Kirim Ucapan</button>
            {wishFeedback && <p className={styles.formFeedback} role="status">{wishFeedback}</p>}
          </form>
        </Reveal>

        <div className={styles.wishesList}>
          <AnimatePresence initial={false}>
            {savedWishes.map((wish) => (
              <motion.div
                key={wish.id}
                className={styles.wishItem}
                initial={{ opacity: 0, y: -18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <div className={styles.wishAvatar}>{wish.name.charAt(0).toUpperCase()}</div>
                <div className={styles.wishContent}>
                  <h4>{wish.name}</h4>
                  <span className={styles.wishTime}>{formatWishTime(wish.createdAt)}</span>
                  <p>{wish.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <Reveal direction="up">
            <div className={styles.wishItem}>
              <div className={styles.wishAvatar}>H</div>
              <div className={styles.wishContent}>
                <h4>Hanip</h4>
                <span className={styles.wishTime}>2 minggu lalu</span>
                <p>selamat yaa atas pernikahan nya</p>
              </div>
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.2}>
            <div className={styles.wishItem}>
              <div className={styles.wishAvatar}>Z</div>
              <div className={styles.wishContent}>
                <h4>Elsa</h4>
                <span className={styles.wishTime}>3 minggu lalu</span>
                <p>pasangan yang lucuuu &gt;.&lt;</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 12. Footer */}
      <footer className={styles.footer}>
        <Reveal direction="up">
          <p>Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i, berkenan hadir dan memberikan do'a restu kepada Kami.</p>
          <p>Kami yang berbahagia</p>
          <h2>Hanief & Elsa</h2>
        </Reveal>
      </footer>

    </div>
  );
};

export default MainContent;
