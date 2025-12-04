import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ImageIcon } from 'lucide-react';
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
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleImageError = (index: number) => {
        setImageErrors(prev => new Set(prev).add(index));
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
                                className="absolute left-4 z-50 bg-background/90 hover:bg-background text-primary border border-border h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                                onClick={goToPrevious}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 z-50 bg-background/90 hover:bg-background text-primary border border-border h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                                onClick={goToNext}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </>
                    )}

                    {/* Image container */}
                    <div className="w-full h-full flex items-center justify-center">
                        {!imageErrors.has(currentIndex) ? (
                            <img
                                src={images[currentIndex]}
                                alt={`Image ${currentIndex + 1}`}
                                className="max-h-[90vh] max-w-full object-contain"
                                onError={() => handleImageError(currentIndex)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 bg-muted/50 backdrop-blur-sm rounded-lg p-12">
                                <ImageIcon className="h-24 w-24 text-muted-foreground" />
                                <p className="text-muted-foreground text-sm">Image failed to load</p>
                            </div>
                        )}
                    </div>

                    {/* Image counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full text-primary-foreground text-sm font-medium shadow-lg">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
