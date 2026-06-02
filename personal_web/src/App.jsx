import { Routes, Route, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { Archive } from "./pages/Archive";
import { NotFound } from "./pages/NotFound";
import { AnimatePresence } from "framer-motion";
import transition from './transition';
import { SceneProvider } from "./utils/SceneContext";
import SceneBackground from "./components/SceneBackground";

export default function App() {
    const location = useLocation();
    const HomeWithTransition = transition(Home);
    const ArchiveWithTransition = transition(Archive);
    return (
        <SceneProvider>
            <SceneBackground />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route index element={<HomeWithTransition />} />
                    <Route path="archive" element={<ArchiveWithTransition />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AnimatePresence>
        </SceneProvider>
    );
}

