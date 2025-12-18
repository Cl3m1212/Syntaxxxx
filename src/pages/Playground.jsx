import React from 'react';
import { useLocation } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';

export default function Playground() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lang = searchParams.get('lang') || 'HTML';

  return (
    <div className="h-full flex flex-col">
      <CodeEditor initialLanguage={lang} />
    </div>
  );
}