// resources/js/components/image-viewer.tsx

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ImageViewerProps {
    images: string[];
    initialIndex?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ImageViewer({ images, initialIndex = 0, open, onOpenChange }: ImageViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl p-0">
                <div className="relative bg-black">
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                    >
                        <X className="w-5 h-5" />
                    </Button>

                    {images.length > 1 && (
                        <>
                            <Button
                                onClick={goToPrevious}
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>

                            <Button
                                onClick={goToNext}
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </>
                    )}

                    <img
                        src={`/storage/${images[currentIndex]}`}
                        alt={`Image ${currentIndex + 1}`}
                        className="w-full h-auto max-h-[85vh] object-contain"
                    />

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
