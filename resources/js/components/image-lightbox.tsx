import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
            <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 bg-[#2C3E50] border-none [&>button]:bg-[#E55A2B] [&>button]:text-white [&>button]:hover:bg-[#D14D24]">
                <VisuallyHidden>
                    <DialogTitle>Image Gallery</DialogTitle>
                </VisuallyHidden>

                <div className="relative w-full h-full flex items-center justify-center p-12">
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 z-50 bg-[#E55A2B] text-white hover:bg-[#D14D24] h-12 w-12 rounded-full shadow-lg"
                                onClick={goToPrevious}
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 z-50 bg-[#E55A2B] text-white hover:bg-[#D14D24] h-12 w-12 rounded-full shadow-lg"
                                onClick={goToNext}
                            >
                                <ChevronRight className="h-8 w-8" />
                            </Button>
                        </>
                    )}

                    <div className="w-full h-[calc(90vh-6rem)] flex items-center justify-center">
                        <img
                            src={images[currentIndex]}
                            alt={`Image ${currentIndex + 1}`}
                            className="h-full w-auto object-contain"
                        />
                    </div>

                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#E55A2B] px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
