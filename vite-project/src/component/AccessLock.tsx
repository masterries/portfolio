import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface AccessLockProps {
  onUnlock: () => void;
}

const AccessLock: React.FC<AccessLockProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlPassword = urlParams.get('password');
    if (urlPassword === 'Forza') {
      onUnlock();
    }
  }, [onUnlock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Forza') {
      onUnlock();
    } else {
      setError(t('accessLock.error'));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">{t('accessLock.title')}</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('accessLock.placeholder')}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          {t('accessLock.submit')}
        </button>
      </form>
    </div>
  );
};

export default AccessLock;