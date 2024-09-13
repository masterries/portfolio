export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  challenges: string;
  learnings: string;
  githubLink: string;
  liveLink: string;
  demoComponent: string;
  date: string;
}

const projectsData: Project[] = [
  {
    id: 'project-4Wins',
    title: '4 Wins Game',
    description: 'projects.fourWins.description',
    techStack: ['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS'],
    features: [
      'projects.fourWins.feature1',
      'projects.fourWins.feature2',
      'projects.fourWins.feature3',
    ],
    challenges: 'projects.fourWins.challenges',
    learnings: 'projects.fourWins.learnings',
    githubLink: 'https://github.com/yourusername/4wins-game',
    liveLink: 'https://4wins-game.yourdomain.com',
    demoComponent: 'FourWinsGame.tsx',
    date: "2024-08-30"
  },
  {
    id: 'project-Asteroids',
    title: 'Asteroids Game',
    description: 'projects.asteroids.description',
    techStack: ['React', 'TypeScript', 'Canvas API', 'Game Development'],
    features: [
      'projects.asteroids.feature1',
      'projects.asteroids.feature2',
      'projects.asteroids.feature3',
    ],
    challenges: 'projects.asteroids.challenges',
    learnings: 'projects.asteroids.learnings',
    githubLink: 'https://github.com/yourusername/asteroids-game',
    liveLink: 'https://asteroids-game.yourdomain.com',
    demoComponent: 'AsteroidsGame.tsx',
    date: "2024-09-06"
  },
  {
    id: 'project-AStarSimulation',
    title: 'AStarSimulation',
    description: 'projects.asteroids.description',
    techStack: ['React', 'TypeScript', 'Canvas API', 'Game Development'],
    features: [
      'projects.asteroids.feature1',
      'projects.asteroids.feature2',
      'projects.asteroids.feature3',
    ],
    challenges: 'projects.asteroids.challenges',
    learnings: 'projects.asteroids.learnings',
    githubLink: 'https://github.com/yourusername/asteroids-game',
    liveLink: 'https://asteroids-game.yourdomain.com',
    demoComponent: 'AStarSimulation.tsx',
    date: "2024-09-10"
  },
  {
    id: 'project-Fractal3D',
    title: 'Fractal3D',
    description: 'projects.fractal3D.description',
    techStack: ['React', 'Three.js', 'WebGL', '3D Graphics',"Recursion"],
    features: [
      'projects.fractal3D.feature1',
      'projects.fractal3D.feature2',
      'projects.fractal3D.feature3',
    ],
    challenges: 'projects.fractal3D.challenges',
    learnings: 'projects.fractal3D.learnings',
    githubLink: 'https://github.com/yourusername/fractal3d',
    liveLink: 'https://fractal3d.yourdomain.com',
    demoComponent: 'FractalTree3D.tsx',
    date: "2024-09-11"
  },
  {
    id: 'project-FractalForset',
    title: 'Fractal Forest',
    description: 'projects.fractalForest.description',
    techStack: ['React', 'Canvas API', 'Fractal Algorithms', 'Interactive Graphics'],
    features: [
      'projects.fractalForest.feature1',
      'projects.fractalForest.feature2',
      'projects.fractalForest.feature3',
    ],
    challenges: 'projects.fractalForest.challenges',
    learnings: 'projects.fractalForest.learnings',
    githubLink: 'https://github.com/yourusername/fractal-forest',
    liveLink: 'https://fractal-forest.yourdomain.com',
    demoComponent: 'FractalTreeForest.tsx',
    date: "2024-09-12"
  }
];

export default projectsData;