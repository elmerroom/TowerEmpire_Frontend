import 'bootstrap/dist/js/bootstrap.bundle';
import 'simplebar-react/dist/simplebar.min.css';
import { AppRoutes } from './pages/routes/AppRoutes';
import { InlineSprite } from './shared/ui/icons/inlineSprite';

function App() {
  return (
    <main>
      <InlineSprite defer={false} />
      <AppRoutes />
    </main>
  );
}

export default App;
