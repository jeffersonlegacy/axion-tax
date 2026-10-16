import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import NavBar from './components/NavBar/NavBar';
import ClientPortal from './components/ClientPortal/ClientPortal';
import Footer from './components/Footer/Footer';
import ExperienceEnhancer from './components/ExperienceEnhancer/ExperienceEnhancer';
import ServicesPage from './pages/ServicesPage';
import HomePage from './pages/HomePage';
import YourPlanPage from './pages/YourPlanPage';
import './index.css';

const planHashes = ['#your-plan'];
const toolHashes = [
  '#tools',
  '#familia-tools',
  '#find-my-money',
  '#tax-deadline-planner'
];

const portalHashes = [
  '#portal',
  '#portal-overview',
  '#portal-appointments',
  '#portal-documents',
  '#portal-tools',
  '#portal-schedule-c',
  '#portal-updates'
];

const resolveViewFromHash = (hash) => {
  if (planHashes.some((routeHash) => hash.startsWith(routeHash))) return 'plan';
  if (toolHashes.some((routeHash) => hash.startsWith(routeHash))) return 'tools';
  if (portalHashes.some((routeHash) => hash.startsWith(routeHash))) return 'portal';
  return 'home';
};

function App() {
  const [view, setView] = React.useState('home');

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '#home';
      if (hash === '#book') {
        window.location.hash = '#portal-appointments';
        return;
      }
      setView(resolveViewFromHash(hash));
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  React.useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const targetId = hash.slice(1);
    requestAnimationFrame(() => {
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, [view]);

  return (
    <LanguageProvider>
      <div className={`app-container app-view-${view}`}>
        <NavBar />
        {view !== 'portal' && <ExperienceEnhancer />}
        <main>
          {view === 'home' && <HomePage />}
          {view === 'plan' && <YourPlanPage />}
          {view === 'tools' && <ServicesPage />}
          {view === 'portal' && <ClientPortal />}
        </main>
        {view !== 'portal' && <Footer />}
      </div>
    </LanguageProvider>
  );
}

export default App;
