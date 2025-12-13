import { useCallback, useLayoutEffect, useState } from 'react';

const getFullscreenElement = (): Element | null => {
    const doc = document as any;
    return doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
};

const requestFullscreen = (element: HTMLElement) => {
    const el = element as any;
    if (el.requestFullscreen) {
        el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
    }
};

const exitFullscreen = () => {
    const doc = document as any;
    if (doc.exitFullscreen) {
        doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
    }
};

export const useFullscreen = (elementRef: React.RefObject<HTMLElement>) => {
    const [isFullscreen, setIsFullscreen] = useState(!!getFullscreenElement());

    const handleFullscreenChange = useCallback(() => {
        setIsFullscreen(!!getFullscreenElement());
    }, []);

    useLayoutEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [handleFullscreenChange]);

    const toggleFullscreen = useCallback(() => {
        if (isFullscreen) {
            exitFullscreen();
        } else if (elementRef.current) {
            requestFullscreen(elementRef.current);
        }
    }, [isFullscreen, elementRef]);

    return { isFullscreen, toggleFullscreen };
};