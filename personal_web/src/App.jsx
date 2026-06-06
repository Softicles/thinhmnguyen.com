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

// Full-screen cover shown while the lazy Archive chunk downloads on first visit.
// The sky background is rendered behind the router (z-index:-1) and persists
// across navigation, so a `null` fallback would leave it uncovered during the
// load gap — on a cold/hard-reloaded cache the sky gets revealed before the
// page's slide transition has finished. Matching the transition panel's colour
// keeps the screen continuously covered until Archive mounts and its slide-out
// reveal plays.
const RouteCover = () => (
    <div style={{ position: "fixed", inset: 0, background: "#0f0f0f", zIndex: 9999 }} />
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
                            // Cover the screen while the archive chunk loads so
                            // the persistent sky (rendered behind the router) is
                            // not revealed before the slide transition runs.
                            <Suspense fallback={<RouteCover />}>
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

