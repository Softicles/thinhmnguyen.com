import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { NotFound } from "./pages/NotFound";
import { AnimatePresence } from "framer-motion";
import transition from './transition';
import { SceneProvider } from "./utils/SceneContext";
import SceneBackground from "./components/SceneBackground";
import avatar from "./components/imgs/IMG_2763_cropped.webp";

// Resolve once the image at `src` has been fetched + decoded (or failed). Used
// to keep a route's cover up until its above-the-fold image is ready to paint.
const preloadImage = (src) =>
    new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = src;
    });

// Home is gated behind the same lazy + Suspense cover as Archive so the slide
// transition never reveals a half-painted page. Archive's cover holds until its
// chunk downloads; Home's holds until the hero avatar (its only above-the-fold
// image) is decoded, so the reveal doesn't expose the avatar popping in. The
// avatar URL is imported above so the preload can start immediately.
const HomeWithTransition = lazy(() =>
    Promise.all([import("./pages/Home"), preloadImage(avatar)]).then(
        ([m]) => ({ default: transition(m.Home) })
    )
);

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
    return (
        <SceneProvider>
            <SceneBackground />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route
                        index
                        element={
                            // Keep the screen covered until Home's chunk loads
                            // and its hero image is decoded, so the slide reveal
                            // doesn't expose the page mid-load (mirrors Archive).
                            <Suspense fallback={<RouteCover />}>
                                <HomeWithTransition />
                            </Suspense>
                        }
                    />
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

