/**
 * 应用入口组件
 */

import { RouterProvider } from 'react-router-dom';
import router from './router';
import './index.css';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
