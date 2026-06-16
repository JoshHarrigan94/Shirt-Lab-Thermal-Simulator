import { Controls } from './components/Controls';
import { ResultsPanel } from './components/ResultsPanel';
import { ShirtScene } from './components/ShirtScene';
import './styles.css';

export default function App() {
  return <main className="app">
    <Controls />
    <ShirtScene />
    <ResultsPanel />
  </main>
}
