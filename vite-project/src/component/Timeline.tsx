import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TimelineEvent = ({ event, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

  const flipVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 }
  };

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="w-full h-full transition-transform duration-500 cursor-pointer"
          animate={isHovered ? 'back' : 'front'}
          variants={flipVariants}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div 
            className="absolute w-full h-full backface-hidden bg-gray-800 p-4 rounded-lg"
            initial={{ background: "rgba(59, 130, 246, 0)" }}
            whileInView={{ background: ["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0)"] }}
            transition={{ duration: 1.5, delay: index * 0.3 }}
          >
            <motion.h3 
              className="text-xl font-semibold text-blue-400"
              initial={{ y: 20, opacity: 0, scale: 1 }}
              whileInView={{ y: 0, opacity: 1, scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, delay: index * 0.3 + 0.2, times: [0, 0.5, 1] }}
            >
              {event.year}
            </motion.h3>
            <motion.h4 
              className="text-lg font-medium text-white"
              initial={{ y: 20, opacity: 0, scale: 1 }}
              whileInView={{ y: 0, opacity: 1, scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, delay: index * 0.3 + 0.4, times: [0, 0.5, 1] }}
            >
              {t(`timeline.events.${index}.title`)}
            </motion.h4>
            <motion.p
              className="text-gray-300"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.3 + 0.6 }}
            >
              {t(`timeline.events.${index}.description`)}
            </motion.p>
          </motion.div>
          <motion.div 
            className="absolute w-full h-full backface-hidden bg-blue-800 p-4 rounded-lg"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="transform rotate-y-180">
              <h4 className="text-lg font-medium mb-2 text-white">{t('timeline.achievements')}:</h4>
              <ul className="list-disc list-inside text-gray-200">
                {event.achievements.map((achievement, i) => (
                  <li key={i}>{t(`timeline.events.${index}.achievements.${i}`)}</li>
                ))}
              </ul>
            </div>
          </motion.div>
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