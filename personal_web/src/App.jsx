import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { AnimatePresence } from "framer-motion";
import transition from './transition';
import { SceneProvider } from "./utils/SceneContext";
import SceneBackground from "./components/SceneBackground";

// The Archive page pulls in the photo album (anime.js, photo data, lightbox,
// control panel, …) that is only ever used on /archive. Lazy-load it so none of
// that ships in the initial homepage bundle — it's fetched on demand when the
// route is first visited. The transition HOC is applied to the loaded module.
const ArchiveWithTransition = lazy(() =>
    import("./pages/Archive").then((m) => ({ default: transition(m.Archive) }))
);

export default function App() {
    const location = useLocation();
    const HomeWithTransition = transition(Home);
    return (
        <SceneProvider>
            <SceneBackground />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route index element={<HomeWithTransition />} />
                    <Route
                        path="archive"
                        element={
                            // null fallback: the persistent sky background lives
                            // outside the router, so nothing flashes while the
                            // archive chunk loads on first visit.
                            <Suspense fallback={null}>
                                <ArchiveWithTransition />
                            </Suspense>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AnimatePresence>
        </SceneProvider>
    );
}

