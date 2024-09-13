import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import projectsData, { Project } from './projectsData';

const ProjectList: React.FC = () => {
  const { t } = useTranslation();

  // Sort projects by date (newest first)
  const sortedProjects = [...projectsData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group projects by month and year
  const groupedProjects = sortedProjects.reduce((groups, project) => {
    const date = new Date(project.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(project);
    return groups;
  }, {} as Record<string, Project[]>);

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-700 text-white min-h-screen py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-12 text-center">{t('projects.allProjects')}</h1>
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-0 w-1 bg-blue-500 h-full rounded-full"></div>

          {Object.entries(groupedProjects).map(([monthYear, projects], index) => (
            <div key={monthYear} className="mb-16 relative">
              {/* Month/Year marker */}
              <div className="absolute -left-3 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <h2 className="text-2xl font-semibold mb-6 ml-10">{monthYear}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ml-10 auto-rows-fr">
  {projects.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>
            </div>
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

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
        <p className="text-sm text-gray-400 mb-4">
          {new Date(project.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
        </p>
        <p className="mb-4 text-sm">{t(project.description)}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack.map((tech) => (
            <span key={tech} className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
              {tech}
            </span>
          ))}
        </div>
      </div>
      <Link 
        to={`/project/${project.id}`} 
        className="block bg-blue-600 text-white text-center py-2 hover:bg-blue-700 transition duration-300"
      >
        {t('projects.viewProject')}
      </Link>
    </motion.div>
  );
};

export default ProjectList;