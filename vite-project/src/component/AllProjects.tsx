import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AllProjects = () => {
  const { t } = useTranslation();

  const projects = [
    {
      id: 'fourwins',
      title: '4 Wins Game',
      description: t('projects.fourWins.description'),
      techStack: ['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS'],
    },
    {
      id: 'asteroids',
      title: 'Asteroids Game',
      description: t('projects.asteroids.description'),
      techStack: ['React', 'TypeScript', 'Framer Motion', 'Game Development'],
    },
    // Add more projects here as needed
  ];

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-700 text-white min-h-screen py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('projects.allProjects')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/" className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition duration-300">
            {t('projects.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ project }) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-lg shadow-lg"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <h3 className="text-xl font-semibold mb-4">{project.title}</h3>
    <p className="mb-4">{project.description}</p>
    <div className="flex flex-wrap gap-2 mb-4">
      {project.techStack.map((tech) => (
        <span key={tech} className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
          {tech}
        </span>
      ))}
    </div>
    <Link to={`/project/${project.id}`} className="text-blue-400 hover:text-blue-300 transition duration-300">
      View Project
    </Link>
  </motion.div>
);

export default AllProjects;