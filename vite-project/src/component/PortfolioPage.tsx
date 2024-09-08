import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Github, Linkedin, Mail, Code, Database, Brain } from 'lucide-react';
import Draggable from 'react-draggable';
import Timeline from './Timeline';
import { useTranslation } from 'react-i18next';
import AccessLock from './AccessLock';
import AllProjects from './AllProjects';
import { Link } from 'react-router-dom';
import FourWinsGame from './FourWinsGame';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex justify-center space-x-2 py-2">
      {['en', 'de', 'fr', 'lu'].map((lang) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`w-8 h-6 bg-cover bg-center rounded ${i18n.language === lang ? 'ring-2 ring-blue-400' : ''}`}
          style={{ backgroundImage: `url('https://flagcdn.com/w40/${lang === 'en' ? 'gb' : lang}.png')` }}
          aria-label={`Switch to ${lang.toUpperCase()}`}
        />
      ))}
    </div>
  );
};

const PortfolioPage: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);
  
  const [visibleSection, setVisibleSection] = useState('intro');
  const [showFourWins, setShowFourWins] = useState(false);

  useEffect(() => {
    const unlocked = localStorage.getItem('portfolioUnlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const sections = document.querySelectorAll('section');
      
      sections.forEach((section) => {
        if (
          scrollPosition >= section.offsetTop &&
          scrollPosition <= section.offsetTop + section.offsetHeight
        ) {
          setVisibleSection(section.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem('portfolioUnlocked', 'true');
  };

  const toggleFourWins = () => {
    setShowFourWins(!showFourWins);
  };

  if (!isUnlocked) {
    return <AccessLock onUnlock={handleUnlock} />;
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-700 text-white min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg">
        <nav className="container mx-auto px-6 py-3">
          <ul className="flex justify-center space-x-6 items-center">
            {['intro', 'journey', 'skills', 'projects', 'contact'].map((section) => (
              <li key={section}>
                <a
                  href={`#${section}`}
                  className={`capitalize ${
                    visibleSection === section ? 'text-blue-400 font-semibold' : 'text-gray-300'
                  } hover:text-blue-300 transition duration-300`}
                >
                  {t(`header.${section}`)}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={toggleFourWins}
                className="text-blue-400 hover:text-blue-300 transition duration-300"
              >
                4 Wins
              </button>
            </li>
          </ul>
        </nav>
        <LanguageSwitcher />
      </header>

      <main className="container mx-auto px-6 py-20">
        <Section id="intro">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">{t('intro.name')}</h1>
            <p className="text-2xl mb-8">{t('intro.title')}</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 120 }}
            >
              <a href="#journey" className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition duration-300">
                {t('intro.cta')}
              </a>
            </motion.div>
          </motion.div>
        </Section>

        <Section id="journey">
          <Timeline />
        </Section>

        <Section id="skills">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('skills.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SkillCard icon={Code} title={t('skills.programming.title')} skills={t('skills.programming.skills', { returnObjects: true })} />
            <SkillCard icon={Database} title={t('skills.dataScience.title')} skills={t('skills.dataScience.skills', { returnObjects: true })} />
            <SkillCard icon={Brain} title={t('skills.aiDevOps.title')} skills={t('skills.aiDevOps.skills', { returnObjects: true })} />
          </div>
        </Section>

        <Section id="projects">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('projects.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t('projects.items', { returnObjects: true }).map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                description={project.description}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/projects" className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition duration-300">
              {t('projects.viewAll')}
            </Link>
          </div>
        </Section>

        <Section id="contact">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('contact.title')}</h2>
          <div className="text-center">
            <p className="text-lg mb-8">
              {t('contact.description')}
            </p>
            <div className="flex justify-center space-x-6">
              <SocialIcon icon={Github} link={t('contact.github')} />
              <SocialIcon icon={Linkedin} link={t('contact.linkedin')} />
              <SocialIcon icon={Mail} link={t('contact.email')} />
            </div>
          </div>
        </Section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

      {showFourWins && (
        <Draggable bounds="parent">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-4 rounded-lg shadow-lg cursor-move z-50" style={{ width: '300px', height: '300px' }}>
            <button
              onClick={toggleFourWins}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <FourWinsGame />
          </div>
        </Draggable>
      )}
    </div>
  );
};

const Section: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <section id={id} className="py-20">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  </section>
);

const SkillCard: React.FC<{ icon: React.ComponentType; title: string; skills: string[] }> = ({ icon: Icon, title, skills }) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-lg shadow-lg"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Icon className="w-12 h-12 mb-4 mx-auto text-blue-400" />
    <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
    <ul className="list-disc pl-5">
      {skills.map((skill, index) => (
        <li key={index} className="mb-2">{skill}</li>
      ))}
    </ul>
  </motion.div>
);

const ProjectCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-lg shadow-lg"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p>{description}</p>
  </motion.div>
);

const SocialIcon: React.FC<{ icon: React.ComponentType; link: string }> = ({ icon: Icon, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition duration-300">
    <Icon size={24} />
  </a>
);

export default PortfolioPage;