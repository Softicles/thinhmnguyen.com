import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useScene } from './utils/SceneContext';

// Resolve once every in-document image has settled and webfonts are ready, so
// the reveal doesn't expose a half-painted page. A broken image resolves via
// its error event so it can't stall the gate.
const waitForContent = () => {
    const images = Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
            (img) =>
                new Promise((resolve) => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                })
        );
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    return Promise.all([...images, fonts]);
};

const transition = (OgComponent) => {
    return (props) => {
        // sceneReady flips once the Three.js sky has actually drawn its clouds/
        // rain. The cover stays up until then so the reveal never shows an empty
        // sky. It's already true after the first load, so later route changes
        // only wait on their own content, not the scene again.
        const { sceneReady } = useScene();
        const [contentReady, setContentReady] = useState(false);
        // Safety net: force the reveal after a few seconds so a stalled asset or
        // a sky that never reports ready can't trap the page under the cover.
        const [timedOut, setTimedOut] = useState(false);

        useEffect(() => {
            let cancelled = false;
            waitForContent().then(() => {
                if (!cancelled) setContentReady(true);
            });
            const fallback = setTimeout(() => {
                if (!cancelled) setTimedOut(true);
            }, 4000);
            return () => {
                cancelled = true;
                clearTimeout(fallback);
            };
        }, []);

        // Hold the slide-out panel fully covering the page until everything is
        // loaded, then retract it to play the reveal.
        const ready = timedOut || (contentReady && sceneReady);

        return (
            <>
                <OgComponent {...props} />
                <motion.div
                    className='slide-in'
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 0 }}
                    exit={{ scaleY: 1 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                    className='slide-out'
                    initial={{ scaleY: 1 }}
                    animate={{ scaleY: ready ? 0 : 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
            </>
        );
    };
};

export default transition;
