import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageLightboxProps {
    images: string[];
    initialIndex?: number;
    open: boolean;
    onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, open, onClose }: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-auto h-[90vh] p-0 bg-transparent border-none shadow-none">
                <VisuallyHidden>
                    <DialogTitle>Image Gallery</DialogTitle>
                </VisuallyHidden>

                {/* Custom close button */}
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-50 h-8 w-8"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Navigation buttons */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 z-50 bg-white/80 hover:bg-white h-10 w-10 rounded-full shadow-lg"
                                onClick={goToPrevious}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 z-50 bg-white/80 hover:bg-white h-10 w-10 rounded-full shadow-lg"
                                onClick={goToNext}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </>
                    )}

                    {/* Image container */}
                    <div className="w-full h-full flex items-center justify-center">
                        <img
                            src={images[currentIndex]}
                            alt={`Image ${currentIndex + 1}`}
                            className="max-h-[90vh] max-w-full object-contain"
                        />
                    </div>

                    {/* Image counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white text-sm font-medium">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
