import { dashboard, login, register } from '@/routes';
import { type PageProps, type Gallery, type Feedback, type Announcement, type Accommodation } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MapPin, Phone, Mail, Facebook, Star, Quote, ImageIcon, MessageSquare, Megaphone, X, ArrowUp, Hotel, Eye, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '@/components/image-lightbox';
import { logout } from '@/routes';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WelcomeProps extends PageProps {
    latestAnnouncement: Announcement | null;
    galleries: Gallery[];
    accommodations: Accommodation[];
    feedbacks: Feedback[];
}

import { FAQChatbot } from '@/components/faq-chatbot';

export default function Welcome() {
    const { auth, latestAnnouncement, galleries, accommodations, feedbacks } = usePage<WelcomeProps>().props;
    const [showAnnouncement, setShowAnnouncement] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (images: string[], index: number = 0) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${
                            i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|playfair-display:400,700|cormorant-garamond:400,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#F5F2E8] px-4 py-6 text-[#2C3E50] sm:px-6 lg:px-8">
                <header className="mb-6 w-full max-w-7xl">
                    <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
                        {auth.user ? (
                            <>
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs sm:px-5 sm:text-sm font-medium text-white bg-[#E55A2B] border border-[#E55A2B] rounded-md hover:bg-[#D14D24] hover:border-[#D14D24] active:bg-[#B8421F] transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Dashboard
                                </Link>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:px-5 sm:text-sm font-medium text-white bg-[#E55A2B] border border-[#E55A2B] rounded-md hover:bg-[#D14D24] hover:border-[#D14D24] active:bg-[#B8421F] transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            <span className="max-w-20 sm:max-w-none truncate">{auth.user.name}</span>
                                            <ChevronDown className="h-4 w-4 shrink-0" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={logout()}
                                                method="post"
                                                as="button"
                                                className="w-full text-left"
                                            >
                                                Logout
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs sm:px-5 sm:text-sm font-medium text-white bg-[#E55A2B] border border-[#E55A2B] rounded-md hover:bg-[#D14D24] hover:border-[#D14D24] active:bg-[#B8421F] transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-block rounded-sm border border-[#D4B896] px-3 py-1.5 text-xs sm:px-5 sm:text-sm leading-normal text-[#1F5F5B] hover:border-[#C3A277] hover:bg-[#EBE6D8] transition-all duration-200"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 starting:opacity-0">
                    <main className="flex w-full max-w-7xl flex-col space-y-12 sm:space-y-16">
                        {/* Hero Section */}
                        <section className="flex flex-col-reverse lg:flex-row lg:items-center lg:gap-12">
                            <div className="relative -mb-px aspect-335/376 w-full shrink-0 overflow-hidden rounded-t-lg bg-[#EBE6D8] sm:aspect-4/3 lg:mb-0 lg:aspect-4/5 lg:w-[480px] lg:rounded-lg lg:shadow-2xl">
                                <img
                                    src="/dk_bg.jpeg"
                                    alt="Debbie & Krys Beach Resort"
                                    className="w-full h-full object-cover transition-all duration-750"
                                />
                                <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(212,184,150,0.3)] lg:rounded-lg" />
                            </div>

                            <div className="flex flex-col items-center lg:items-start lg:flex-1 text-center lg:text-left space-y-6 sm:space-y-8 py-8 sm:py-12 lg:py-0">
                                <div className="space-y-4 sm:space-y-6">
                                    <h1
                                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#2C3E50] leading-tight"
                                        style={{ fontFamily: 'Playfair Display, serif' }}
                                    >
                                        Debbie & Krys
                                    </h1>
                                    <h2
                                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#2C3E50] tracking-wide leading-tight"
                                        style={{ fontFamily: 'Playfair Display, serif' }}
                                    >
                                        Beach Resort
                                    </h2>
                                </div>

                                <div className="w-24 h-px bg-linear-to-r from-[#E55A2B] to-[#F06B3B]"></div>

                                <div
                                    className="space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg text-[#64748B] font-medium"
                                    style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#E55A2B] shrink-0" />
                                        <a
                                            href="https://maps.app.goo.gl/Fvkn2SNiKCa1pXsp8"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-[#E55A2B] transition-colors duration-200 cursor-pointer text-left"
                                            title="Open in Google Maps"
                                        >
                                            Sampaguita, Bauan, Batangas, Philippines
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#E55A2B] shrink-0" />
                                        <a
                                            href="tel:+639278210836"
                                            className="font-mono tracking-wider hover:text-[#E55A2B] transition-colors duration-200 cursor-pointer"
                                            title="Click to call"
                                        >
                                            0927 821 0836
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#E55A2B] shrink-0" />
                                        <a
                                            href="mailto:debbiekrysb@gmail.com"
                                            className="break-all hover:text-[#E55A2B] transition-colors duration-200 cursor-pointer"
                                            title="Click to send email"
                                        >
                                            debbiekrysb@gmail.com
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-[#E55A2B] shrink-0" />
                                        <a
                                            href="https://www.facebook.com/DebbieAndKrysBeachResort/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-[#E55A2B] transition-colors duration-200 cursor-pointer"
                                            title="Visit our Facebook page"
                                        >
                                            Debbie & Krys Beach Resort
                                        </a>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-2 sm:pt-4 w-full sm:w-auto">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-[#E55A2B] border border-[#E55A2B] rounded-md hover:bg-[#D14D24] hover:border-[#D14D24] active:bg-[#B8421F] transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Announcement Section */}
                        {latestAnnouncement && showAnnouncement ? (
                            <section>
                                <div className="relative rounded-lg border border-secondary/30 bg-secondary/10 p-4 sm:p-6">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 hover:bg-secondary/20 text-secondary"
                                        onClick={() => setShowAnnouncement(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="flex gap-3 sm:gap-4">
                                        <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-secondary mt-0.5" />
                                        <div className="flex-1 pr-6">
                                            <h3
                                                className="text-base sm:text-lg font-bold text-[#2C3E50] mb-2"
                                                style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                                            >
                                                {latestAnnouncement.title}
                                            </h3>
                                            <p className="text-sm sm:text-base text-[#64748B] whitespace-pre-wrap">
                                                {latestAnnouncement.content}
                                            </p>
                                            {latestAnnouncement.published_at && (
                                                <p className="text-xs text-[#64748B] mt-3">
                                                    {format(new Date(latestAnnouncement.published_at), 'MMMM dd, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ) : !latestAnnouncement ? (
                            <section>
                                <Card className="border-[#D4B896]">
                                    <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                                        <Megaphone className="w-10 h-10 sm:w-12 sm:h-12 text-[#D4B896] mb-3" />
                                        <h3
                                            className="text-base sm:text-lg font-semibold text-[#2C3E50] mb-1"
                                            style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                                        >
                                            No Announcements
                                        </h3>
                                        <p className="text-[#64748B] text-center text-sm">
                                            Stay tuned for updates and important information.
                                        </p>
                                    </CardContent>
                                </Card>
                            </section>
                        ) : null}

                        {/* Accommodation Section */}
                        <section id="accommodation" className="scroll-mt-8">
                            <div className="text-center mb-6 sm:mb-8">
                                <h2
                                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C3E50] mb-3"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Accommodation
                                </h2>
                                <div className="w-16 h-px bg-linear-to-r from-[#E55A2B] to-[#F06B3B] mx-auto"></div>
                            </div>

                            {accommodations.length > 0 ? (
                                <Carousel
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-2 sm:-ml-4">
                                        {accommodations.map((accommodation) => (
                                            <CarouselItem key={accommodation.id} className="pl-2 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                                <Card className="overflow-hidden border-[#D4B896] hover:shadow-lg transition-shadow duration-300">
                                                    <CardContent className="p-0">
                                                        <div
                                                            className="aspect-4/3 relative overflow-hidden bg-[#EBE6D8] cursor-pointer"
                                                            onClick={() => accommodation.image_urls.length > 0 && openLightbox(accommodation.image_urls, 0)}
                                                        >
                                                            {accommodation.first_image_url ? (
                                                                <img
                                                                    src={accommodation.first_image_url}
                                                                    alt={accommodation.name}
                                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Hotel className="w-12 h-12 sm:w-16 sm:h-16 text-[#D4B896]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-4 sm:p-5 bg-white space-y-3">
                                                            <div>
                                                                <h3
                                                                    className="font-bold text-[#2C3E50] text-base sm:text-lg mb-1"
                                                                    style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                                                                >
                                                                    {accommodation.name}
                                                                </h3>
                                                                {accommodation.description && (
                                                                    <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2">
                                                                        {accommodation.description}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {accommodation.type.charAt(0).toUpperCase() + accommodation.type.slice(1)}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {accommodation.size.charAt(0).toUpperCase() + accommodation.size.slice(1)}
                                                                </Badge>
                                                                {accommodation.is_air_conditioned && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Air Conditioned
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between pt-2">
                                                                <div>
                                                                    <p className="text-xs text-[#64748B]">Starting from</p>
                                                                    <p className="text-lg sm:text-xl font-bold text-[#E55A2B]">
                                                                        ₱{accommodation.rates && accommodation.rates.length > 0
                                                                            ? Math.min(...accommodation.rates.map(r => parseFloat(r.rate))).toLocaleString()
                                                                            : '0'}
                                                                    </p>
                                                                </div>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button size="sm" variant="outline" className="border-[#D4B896] text-[#1F5F5B] hover:bg-[#EBE6D8] text-xs sm:text-sm">
                                                                            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                                                            <span className="hidden xs:inline">View Details</span>
                                                                            <span className="xs:hidden">Details</span>
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
                                                                        <DialogHeader>
                                                                            <DialogTitle className="text-xl sm:text-2xl font-bold text-[#2C3E50] pr-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                                                {accommodation.name}
                                                                            </DialogTitle>
                                                                        </DialogHeader>
                                                                        <div className="space-y-4 sm:space-y-6">
                                                                            {accommodation.image_urls.length > 0 && (
                                                                                <Carousel className="w-full">
                                                                                    <CarouselContent>
                                                                                        {accommodation.image_urls.map((url, index) => (
                                                                                            <CarouselItem key={index}>
                                                                                                <div
                                                                                                    className="aspect-video relative overflow-hidden rounded-lg cursor-pointer"
                                                                                                    onClick={() => openLightbox(accommodation.image_urls, index)}
                                                                                                >
                                                                                                    <img
                                                                                                        src={url}
                                                                                                        alt={`${accommodation.name} - Image ${index + 1}`}
                                                                                                        className="w-full h-full object-cover"
                                                                                                    />
                                                                                                </div>
                                                                                            </CarouselItem>
                                                                                        ))}
                                                                                    </CarouselContent>
                                                                                    <CarouselPrevious className="left-2" />
                                                                                    <CarouselNext className="right-2" />
                                                                                </Carousel>
                                                                            )}

                                                                            <div className="space-y-4">
                                                                                <div>
                                                                                    <h4 className="font-semibold text-[#2C3E50] mb-2 text-sm sm:text-base">Description</h4>
                                                                                    <p className="text-[#64748B] text-sm sm:text-base">{accommodation.description || 'No description available.'}</p>
                                                                                </div>

                                                                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                                                                    <Badge variant="secondary" className="text-xs">
                                                                                        {accommodation.type.charAt(0).toUpperCase() + accommodation.type.slice(1)}
                                                                                    </Badge>
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        {accommodation.size.charAt(0).toUpperCase() + accommodation.size.slice(1)}
                                                                                    </Badge>
                                                                                    {accommodation.is_air_conditioned && (
                                                                                        <Badge variant="outline" className="text-xs">Air Conditioned</Badge>
                                                                                    )}
                                                                                </div>

                                                                                <div>
                                                                                    <h4 className="font-semibold text-[#2C3E50] mb-3 text-sm sm:text-base">Rates</h4>
                                                                                    <div className="space-y-2">
                                                                                        {accommodation.rates && accommodation.rates.length > 0 ? (
                                                                                            accommodation.rates.map((rate, index) => (
                                                                                                <div key={index} className="flex justify-between items-center p-2 sm:p-3 bg-[#F5F2E8] rounded-lg">
                                                                                                    <span className="text-[#64748B] text-xs sm:text-sm capitalize">{rate.booking_type.replace('_', ' ')}</span>
                                                                                                    <span className="font-bold text-[#E55A2B] text-sm sm:text-base">₱{parseFloat(rate.rate).toLocaleString()}</span>
                                                                                                </div>
                                                                                            ))
                                                                                        ) : (
                                                                                            <p className="text-[#64748B] text-sm">No rates available</p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="hidden sm:flex -left-6 md:-left-12 bg-[#E55A2B] text-white hover:bg-[#D14D24] border-none" />
                                    <CarouselNext className="hidden sm:flex -right-6 md:-right-12 bg-[#E55A2B] text-white hover:bg-[#D14D24] border-none" />
                                </Carousel>
                            ) : (
                                <Card className="border-[#D4B896]">
                                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                                        <Hotel className="w-12 h-12 sm:w-16 sm:h-16 text-[#D4B896] mb-4" />
                                        <h3
                                            className="text-lg sm:text-xl font-semibold text-[#2C3E50] mb-2"
                                            style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                                        >
                                            No Accommodation Available
                                        </h3>
                                        <p className="text-[#64748B] text-center text-sm sm:text-base">
                                            Check back soon for our available accommodations.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </section>

                        {/* Gallery Section */}
                        <section id="gallery" className="scroll-mt-8">
                            <div className="text-center mb-6 sm:mb-8">
                                <h2
                                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C3E50] mb-3"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Gallery
                                </h2>
                                <div className="w-16 h-px bg-linear-to-r from-[#E55A2B] to-[#F06B3B] mx-auto"></div>
                            </div>

                            {galleries.length > 0 ? (
                                <Carousel
                                    opts={{
                                        align: 'start',
                                        loop: true,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent>
                                        {galleries.map((gallery) => (
                                            <CarouselItem
                                                key={gallery.id}
                                                className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                                            >
                                                <div className="p-2">
                                                    <Card className="overflow-hidden border-[#D4B896]">
                                                        <CardContent className="p-0">
                                                            <div
                                                                className="aspect-square relative overflow-hidden cursor-pointer"
                                                                onClick={() => openLightbox([gallery.image_url], 0)}
                                                            >
                                                                <img
                                                                    src={gallery.image_url}
                                                                    alt={gallery.title}
                                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                                />
                                                            </div>
                                                            <div className="p-3 sm:p-4 bg-white">
                                                                <h3
                                                                    className="font-semibold text-[#2C3E50] text-sm sm:text-base mb-1"
                                                                    style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                                                                >
                                                                    {gallery.title}
                                                                </h3>
                                                                {gallery.description && (
                                                                    <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2">
                                                                        {gallery.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="border-[#D4B896] text-[#2C3E50] hover:bg-[#EBE6D8]" />
                                    <CarouselNext className="border-[#D4B896] text-[#2C3E50] hover:bg-[#EBE6D8]" />
                                </Carousel>
                            ) : (
                                <Card className="border-[#D4B896]">
                                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                                        <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#D4B896] mb-4" />
                                        <h3
                                            className="text-lg sm:text-xl font-semibold text-[#2C3E50] mb-2"
                                            style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                                        >
                                            No Gallery Images Yet
                                        </h3>
                                        <p className="text-[#64748B] text-center text-sm sm:text-base">
                                            We're currently updating our gallery. Check back soon!
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </section>

                        {/* Feedbacks Section */}
                        <section className="pb-12 sm:pb-16">
                            <div className="text-center mb-6 sm:mb-8">
                                <h2
                                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C3E50] mb-3"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Feedbacks
                                </h2>
                                <div className="w-16 h-px bg-linear-to-r from-[#E55A2B] to-[#F06B3B] mx-auto"></div>
                            </div>

                            {feedbacks.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {feedbacks.map((feedback) => (
                                        <Card
                                            key={feedback.id}
                                            className="border-[#D4B896] hover:shadow-lg transition-shadow duration-300"
                                        >
                                            <CardContent className="p-4 sm:p-6">
                                                <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-[#E55A2B] opacity-50 mb-3" />
                                                <div className="mb-3">{renderStars(feedback.rating)}</div>
                                                {feedback.comment && (
                                                    <p className="text-[#64748B] text-xs sm:text-sm mb-4 line-clamp-4 italic">
                                                        "{feedback.comment}"
                                                    </p>
                                                )}
                                                <div className="border-t border-[#D4B896] pt-3">
                                                    <p
                                                        className="font-semibold text-[#2C3E50] text-sm sm:text-base"
                                                        style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                                                    >
                                                        {feedback.guest_name}
                                                    </p>
                                                    <p className="text-xs text-[#64748B]">
                                                        {format(new Date(feedback.created_at), 'MMMM dd, yyyy')}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-[#D4B896]">
                                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                                        <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-[#D4B896] mb-4" />
                                        <h3
                                            className="text-lg sm:text-xl font-semibold text-[#2C3E50] mb-2"
                                            style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                                        >
                                            No Reviews Yet
                                        </h3>
                                        <p className="text-[#64748B] text-center text-sm sm:text-base">
                                            Be the first to share your experience at our resort!
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </section>
                    </main>
                </div>

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 p-2.5 sm:p-3 bg-[#E55A2B] text-white rounded-full shadow-lg hover:bg-[#D14D24] transition-all duration-200 hover:shadow-xl"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-[#D4B896] bg-[#EBE6D8]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
                        {/* Brand */}
                        <div className="space-y-3 sm:space-y-4">
                            <h3
                                className="text-xl sm:text-2xl font-bold text-[#2C3E50]"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                Debbie & Krys Beach Resort
                            </h3>
                            <p className="text-xs sm:text-sm text-[#64748B]">
                                Your perfect getaway destination. Experience the beauty of the beach with comfort and hospitality.
                            </p>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-3 sm:space-y-4">
                            <h4
                                className="text-base sm:text-lg font-semibold text-[#2C3E50]"
                                style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                            >
                                Contact Us
                            </h4>
                            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#E55A2B] shrink-0 mt-0.5" />
                                    <a
                                        href="https://maps.app.goo.gl/Fvkn2SNiKCa1pXsp8"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200"
                                    >
                                        Sampaguita, Bauan, Batangas, Philippines
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#E55A2B] shrink-0" />
                                    <a
                                        href="tel:+639278210836"
                                        className="text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200 font-mono"
                                    >
                                        0927 821 0836
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#E55A2B] shrink-0" />
                                    <a
                                        href="mailto:debbiekrysb@gmail.com"
                                        className="text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200 break-all"
                                    >
                                        debbiekrysb@gmail.com
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-[#E55A2B] shrink-0" />
                                    <a
                                        href="https://www.facebook.com/DebbieAndKrysBeachResort/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200"
                                    >
                                        Debbie & Krys Beach Resort
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-3 sm:space-y-4">
                            <h4
                                className="text-base sm:text-lg font-semibold text-[#2C3E50]"
                                style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                            >
                                Quick Links
                            </h4>
                            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                <Link
                                    href="/guest-bookings/create"
                                    className="block text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200"
                                >
                                    Book Now
                                </Link>
                                <a
                                    href="#accommodation"
                                    className="block text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200"
                                >
                                    Accommodation
                                </a>
                                <a
                                    href="#gallery"
                                    className="block text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200"
                                >
                                    Gallery
                                </a>
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="block text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="block text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="block text-[#64748B] hover:text-[#E55A2B] transition-colors duration-200"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-6 sm:mt-8 border-t border-[#D4B896] pt-6 sm:pt-8 text-center">
                        <p className="text-xs sm:text-sm text-[#64748B]">
                            &copy; {new Date().getFullYear()} Debbie & Krys Beach Resort. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Image Lightbox */}
            <ImageLightbox
                images={lightboxImages}
                initialIndex={lightboxIndex}
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />

            <FAQChatbot />
        </>
    );
}
