import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
import { FullscreenHandler } from './App';

// Добавьте следующий компонент внутри вашего основного приложения
// Например:
// 
// function App() {
//   return (
//     <>
//       <FullscreenHandler />
//       {/* остальные компоненты вашего приложения */}
//     </>
//   );
// }
