import { useCallback, useRef, useState } from 'react';

interface TouchGestureState {
    scale: number;
    translateX: number;
    translateY: number;
    isDragging: boolean;
}

interface TouchGestureHandlers {
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchEnd: (e: React.TouchEvent) => void;
    handleMouseDown: (e: React.MouseEvent) => void;
    handleMouseMove: (e: React.MouseEvent) => void;
    handleMouseUp: () => void;
    handleWheel: (e: React.WheelEvent) => void;
    resetView: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    setScale: (scale: number) => void;
}

interface UseTouchGesturesOptions {
    initialScale?: number;
    minScale?: number;
    maxScale?: number;
    onScaleChange?: (scale: number) => void;
    onTranslateChange?: (x: number, y: number) => void;
}

const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
};

const getCenter = (touch1: React.Touch, touch2: React.Touch): { x: number; y: number } => {
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
    };
};

export const useTouchGestures = (options: UseTouchGesturesOptions = {}): [TouchGestureState, TouchGestureHandlers] => {
    const {
        initialScale = 1,
        minScale = 0.5,
        maxScale = 3,
        onScaleChange,
        onTranslateChange
    } = options;

    const [scale, setScaleState] = useState(initialScale);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const lastTouchDistance = useRef<number | null>(null);
    const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
    const dragStart = useRef({ x: 0, y: 0 });
    const lastTapTime = useRef(0);

    // 双击放大
    const handleDoubleTap = useCallback((clientX: number, clientY: number) => {
        const newScale = scale >= 2 ? 1 : 2;
        setScaleState(newScale);
        onScaleChange?.(newScale);
    }, [scale, onScaleChange]);

    // 触摸开始
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // 双指操作 - 准备缩放
            const distance = getDistance(e.touches[0], e.touches[1]);
            const center = getCenter(e.touches[0], e.touches[1]);
            lastTouchDistance.current = distance;
            lastTouchCenter.current = center;
        } else if (e.touches.length === 1) {
            // 单指操作 - 检查双击
            const now = Date.now();
            const timeSinceLastTap = now - lastTapTime.current;
            
            if (timeSinceLastTap < 300) {
                // 双击
                handleDoubleTap(e.touches[0].clientX, e.touches[0].clientY);
            }
            lastTapTime.current = now;

            // 准备拖拽
            setIsDragging(true);
            dragStart.current = {
                x: e.touches[0].clientX - translateX,
                y: e.touches[0].clientY - translateY
            };
        }
    }, [translateX, translateY, handleDoubleTap]);

    // 触摸移动
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();

        if (e.touches.length === 2) {
            // 双指缩放
            const distance = getDistance(e.touches[0], e.touches[1]);
            const center = getCenter(e.touches[0], e.touches[1]);

            if (lastTouchDistance.current && lastTouchCenter.current) {
                const scaleChange = distance / lastTouchDistance.current;
                const newScale = Math.max(minScale, Math.min(maxScale, scale * scaleChange));
                
                // 计算缩放中心点的位移
                const centerDx = center.x - lastTouchCenter.current.x;
                const centerDy = center.y - lastTouchCenter.current.y;

                setScaleState(newScale);
                setTranslateX(prev => prev + centerDx);
                setTranslateY(prev => prev + centerDy);

                onScaleChange?.(newScale);
                onTranslateChange?.(translateX + centerDx, translateY + centerDy);
            }

            lastTouchDistance.current = distance;
            lastTouchCenter.current = center;
        } else if (e.touches.length === 1 && isDragging) {
            // 单指拖拽
            const newX = e.touches[0].clientX - dragStart.current.x;
            const newY = e.touches[0].clientY - dragStart.current.y;
            
            setTranslateX(newX);
            setTranslateY(newY);
            onTranslateChange?.(newX, newY);
        }
    }, [scale, minScale, maxScale, isDragging, translateX, translateY, onScaleChange, onTranslateChange]);

    // 触摸结束
    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 0) {
            setIsDragging(false);
            lastTouchDistance.current = null;
            lastTouchCenter.current = null;
        }
    }, []);

    // 鼠标事件（PC端）
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - translateX,
            y: e.clientY - translateY
        };
    }, [translateX, translateY]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            const newX = e.clientX - dragStart.current.x;
            const newY = e.clientY - dragStart.current.y;
            
            setTranslateX(newX);
            setTranslateY(newY);
            onTranslateChange?.(newX, newY);
        }
    }, [isDragging, onTranslateChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // 滚轮缩放（以鼠标位置为中心）
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(minScale, Math.min(maxScale, scale * delta));
        
        // 计算鼠标位置作为缩放中心
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // 计算缩放后的位移调整
        const scaleRatio = newScale / scale;
        const dx = mouseX - (mouseX - translateX) * scaleRatio;
        const dy = mouseY - (mouseY - translateY) * scaleRatio;
        
        setScaleState(newScale);
        setTranslateX(dx);
        setTranslateY(dy);
        
        onScaleChange?.(newScale);
        onTranslateChange?.(dx, dy);
    }, [scale, minScale, maxScale, translateX, translateY, onScaleChange, onTranslateChange]);

    // 重置视图
    const resetView = useCallback(() => {
        setScaleState(initialScale);
        setTranslateX(0);
        setTranslateY(0);
        onScaleChange?.(initialScale);
        onTranslateChange?.(0, 0);
    }, [initialScale, onScaleChange, onTranslateChange]);

    // 放大
    const zoomIn = useCallback(() => {
        const newScale = Math.min(maxScale, scale * 1.2);
        setScaleState(newScale);
        onScaleChange?.(newScale);
    }, [scale, maxScale, onScaleChange]);

    // 缩小
    const zoomOut = useCallback(() => {
        const newScale = Math.max(minScale, scale * 0.8);
        setScaleState(newScale);
        onScaleChange?.(newScale);
    }, [scale, minScale, onScaleChange]);

    // 手动设置缩放
    const setScale = useCallback((newScale: number) => {
        const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
        setScaleState(clampedScale);
        onScaleChange?.(clampedScale);
    }, [minScale, maxScale, onScaleChange]);

    return [
        { scale, translateX, translateY, isDragging },
        {
            handleTouchStart,
            handleTouchMove,
            handleTouchEnd,
            handleMouseDown,
            handleMouseMove,
            handleMouseUp,
            handleWheel,
            resetView,
            zoomIn,
            zoomOut,
            setScale
        }
    ];
};