import '../css/app.css';
import './echo';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Global loading state outside React component lifecycle
let isLoadingGlobal = false;
const loadingListeners = new Set<() => void>();

// Register listeners once at module level
router.on('start', () => {
    isLoadingGlobal = true;
    loadingListeners.forEach(listener => listener());
});

router.on('finish', () => {
    isLoadingGlobal = false;
    loadingListeners.forEach(listener => listener());
});

router.on('error', () => {
    isLoadingGlobal = false;
    loadingListeners.forEach(listener => listener());
});

// Loading overlay component subscribes to global state
function LoadingOverlay() {
    const [isLoading, setIsLoading] = useState(isLoadingGlobal);

    useEffect(() => {
        const listener = () => setIsLoading(isLoadingGlobal);
        loadingListeners.add(listener);

        return () => {
            loadingListeners.delete(listener);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
    );
}

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <LoadingOverlay />
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    expand
                    toastOptions={{
                        duration: 5000,
                        className: 'rounded-lg border shadow-lg',
                    }}
                />
            </>
        );
    },
    progress: false,
});

initializeTheme();

// import '../css/app.css';
// import './echo';
// import { createInertiaApp, router } from '@inertiajs/react';
// import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
// import { createRoot } from 'react-dom/client';
// import { initializeTheme } from './hooks/use-appearance';
// import { Toaster } from 'sonner';
// import { configureEcho } from '@laravel/echo-react';
// import { useState, useEffect } from 'react';
// import { Loader2 } from 'lucide-react';
// import NProgress from 'nprogress';

// // configureEcho({
// //     broadcaster: 'pusher',
// // });

// // Stop any stuck progress bars on mount
// // router.on('finish', () => {
// //     NProgress.done();
// // });

// // router.on('start', () => {
// //     NProgress.start();
// // });

// // router.on('error', () => {
// //     NProgress.done();
// // });

// // // Force stop any stuck progress on initial load
// // if (typeof window !== 'undefined') {
// //     NProgress.done();
// // }

// const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// // Global loading overlay component
// function LoadingOverlay() {
//     const [isLoading, setIsLoading] = useState(false);

//     useEffect(() => {
//         const startHandler = () => setIsLoading(true);
//         const finishHandler = () => setIsLoading(false);

//         const removeStart = router.on('start', startHandler);
//         const removeFinish = router.on('finish', finishHandler);

//         return () => {
//             removeStart();
//             removeFinish();
//         };
//     }, []);

//     if (!isLoading) return null;

//     return (
//         <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//             <Loader2 className="h-12 w-12 animate-spin text-white" />
//         </div>
//     );
// }

// createInertiaApp({
//     title: (title) => title ? `${title} - ${appName}` : appName,
//     resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
//     setup({ el, App, props }) {
//         const root = createRoot(el);

//         root.render(
//             <>
//                 <App {...props} />
//                 <LoadingOverlay />
//                 <Toaster
//                     position="top-right"
//                     richColors
//                     closeButton
//                     expand
//                     toastOptions={{
//                         duration: 5000,
//                         className: 'rounded-lg border shadow-lg',
//                     }}
//                 />
//             </>
//         );
//     },
//     progress: false,
// });

// initializeTheme();
