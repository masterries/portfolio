import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Github, ExternalLink } from 'lucide-react';
import FourWinsGame from './FourWinsGame';
import AsteroidsGame from './AsteroidsGame';

const ProjectDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const projects = {
    fourwins: {
      title: '4 Wins Game',
      description: t('projects.fourWins.description'),
      techStack: ['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS'],
      features: [
        t('projects.fourWins.feature1'),
        t('projects.fourWins.feature2'),
        t('projects.fourWins.feature3'),
      ],
      challenges: t('projects.fourWins.challenges'),
      learnings: t('projects.fourWins.learnings'),
      githubLink: 'https://github.com/yourusername/4wins-game',
      liveLink: 'https://4wins-game.yourdomain.com',
    },
    asteroids: {
      title: 'Asteroids Game',
      description: t('projects.asteroids.description'),
      techStack: ['React', 'TypeScript', 'Framer Motion', 'Game Development'],
      features: [
        t('projects.asteroids.feature1'),
        t('projects.asteroids.feature2'),
        t('projects.asteroids.feature3'),
      ],
      challenges: t('projects.asteroids.challenges'),
      learnings: t('projects.asteroids.learnings'),
      githubLink: 'https://github.com/yourusername/asteroids-game',
      liveLink: 'https://asteroids-game.yourdomain.com',
    },
  };

  const project = projects[id];

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-700 text-white min-h-screen py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold mb-8">{project.title}</h1>
          <p className="text-xl mb-6">{project.description}</p>
          
          {id === 'fourwins' && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('projects.liveDemo')}</h2>
              <FourWinsGame />
            </div>
          )}

            {id === 'asteroids' && (
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t('projects.liveDemo')}</h2>
                <AsteroidsGame />
            </div>
            )}
          
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('projects.techStack')}</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span key={tech} className="bg-blue-500 text-white px-3 py-1 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('projects.features')}</h2>
            <ul className="list-disc pl-5">
              {project.features.map((feature, index) => (
                <li key={index} className="mb-2">{feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('projects.challenges')}</h2>
            <p>{project.challenges}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('projects.learnings')}</h2>
            <p>{project.learnings}</p>
          </div>
          
          <div className="flex space-x-4 mb-8">
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition duration-300"
            >
              <Github className="mr-2" size={20} />
              {t('projects.viewOnGithub')}
            </a>
            <a
              href={project.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300"
            >
              <ExternalLink className="mr-2" size={20} />
              {t('projects.viewLive')}
            </a>
          </div>
          
          <Link
            to="/projects"
            className="bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition duration-300"
          >
            {t('projects.backToProjects')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetail;