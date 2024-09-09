import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TimelineEvent = ({ event, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { t } = useTranslation();
  const controls = useAnimation();
  const timeoutRef = useRef(null);

  const handleFlip = useCallback((flipTo) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsFlipped(flipTo);

    controls.start({
      rotateY: flipTo ? 180 : 0,
      transition: { duration: 0.6 }
    }).then(() => {
      setIsAnimating(false);
      // Wir drehen die Karte nicht automatisch zurück, wenn die Animation endet
    });
  }, [isAnimating, controls]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    clearTimeout(timeoutRef.current);
    if (!isAnimating && !isFlipped) {
      handleFlip(true);
    }
  }, [handleFlip, isAnimating, isFlipped]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    timeoutRef.current = setTimeout(() => {
      if (isFlipped && !isAnimating) {
        handleFlip(false);
      }
    }, 300);
  }, [handleFlip, isFlipped, isAnimating]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <motion.div
      className={`flex items-center mb-16 ${
        index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'
      }`}
      initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: index * 0.3 }}
      viewport={{ once: true, amount: 0.8 }}
    >
      <div 
        className={`w-5/12 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}
        style={{ perspective: '1000px' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="w-full h-full cursor-pointer"
          animate={controls}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute w-full h-full backface-hidden bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-400">{event.year}</h3>
            <h4 className="text-lg font-medium text-white">{t(`timeline.events.${index}.title`)}</h4>
            <p className="text-gray-300">{t(`timeline.events.${index}.description`)}</p>
          </div>
          <div 
            className="absolute w-full h-full backface-hidden bg-blue-800 p-4 rounded-lg"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div>
              <h4 className="text-lg font-medium mb-2 text-white">{t('timeline.achievements')}:</h4>
              <ul className="list-disc list-inside text-gray-200">
                {event.achievements.map((achievement, i) => (
                  <li key={i}>{t(`timeline.events.${index}.achievements.${i}`)}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
      <motion.div 
        className="w-2/12 flex justify-center"
        initial={{ scale: 0 }}
        whileInView={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.8, delay: index * 0.3, times: [0, 0.7, 1] }}
      >
        <div className="w-4 h-4 bg-blue-500 rounded-full" />
      </motion.div>
      <div className="w-5/12" />
    </motion.div>
  );
};

const Timeline = () => {
  const { t } = useTranslation();
  const events = t('timeline.events', { returnObjects: true });

  return (
    <div className="relative">
      <h2 className="text-3xl font-bold mb-8 text-center">{t('timeline.title')}</h2>
      <motion.div 
        className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-500"
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {events.map((event, index) => (
        <TimelineEvent key={index} event={event} index={index} />
      ))}
    </div>
  );
};

export default Timeline;