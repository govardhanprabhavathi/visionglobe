
import { CameraFeed } from './components/CameraFeed';
import { GlobeScene } from './components/GlobeScene';
import { Overlay } from './components/Overlay';

function App() {
  return (
    <div className="app-root">
      <CameraFeed />
      <GlobeScene />
      <Overlay />
    </div>
  );
}

export default App;
