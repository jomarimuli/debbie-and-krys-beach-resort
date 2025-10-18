import { dashboard, login, register } from '@/routes';
import { type PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MapPin, Phone, Mail, Facebook } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|playfair-display:400,700|cormorant-garamond:400,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#F5F2E8] p-6 text-[#2C3E50] lg:justify-center lg:p-8">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#D4B896] px-5 py-1.5 text-sm leading-normal text-[#1F5F5B] hover:border-[#C3A277] hover:bg-[#EBE6D8] transition-all duration-200"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center px-5 py-1.5 text-sm font-medium text-white bg-[#E55A2B] border border-[#E55A2B] rounded-md hover:bg-[#D14D24] hover:border-[#D14D24] active:bg-[#B8421F] transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-block rounded-sm border border-[#D4B896] px-5 py-1.5 text-sm leading-normal text-[#1F5F5B] hover:border-[#C3A277] hover:bg-[#EBE6D8] transition-all duration-200"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-6xl lg:flex-row lg:items-center lg:gap-12">
                        <div className="relative -mb-px aspect-[335/376] w-full shrink-0 overflow-hidden rounded-t-lg bg-[#EBE6D8] lg:mb-0 lg:aspect-[4/5] lg:w-[480px] lg:rounded-lg lg:shadow-2xl">
                            <img
                                src="/dk_bg.jpeg"
                                alt="Debbie & Krys Beach Resort"
                                className="w-full h-full object-cover transition-all duration-750"
                            />
                            <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(212,184,150,0.3)] lg:rounded-lg" />
                        </div>

                        <div className="flex flex-col items-center lg:items-start lg:flex-1 text-center lg:text-left space-y-8 py-12 lg:py-0">
                            <div className="space-y-6">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#2C3E50] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    Debbie & Krys
                                </h1>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#2C3E50] tracking-wide leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    Beach Resort
                                </h2>
                            </div>

                            <div className="w-24 h-px bg-gradient-to-r from-[#E55A2B] to-[#F06B3B]"></div>

                            <div className="space-y-3 text-base lg:text-lg text-[#64748B] font-medium" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-[#E55A2B] flex-shrink-0" />
                                    <a
                                        href="https://maps.app.goo.gl/Fvkn2SNiKCa1pXsp8"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-[#E55A2B] transition-colors duration-200 cursor-pointer"
                                        title="Open in Google Maps"
                                    >
                                        Sampaguita, Bauan, Batangas, Philippines
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-[#E55A2B] flex-shrink-0" />
                                    <a
                                        href="tel:+639278210836"
                                        className="font-mono tracking-wider hover:text-[#E55A2B] transition-colors duration-200 cursor-pointer"
                                        title="Click to call"
                                    >
                                        0927 821 0836
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-[#E55A2B] flex-shrink-0" />
                                    <a
                                        href="mailto:debbiekrysb@gmail.com"
                                        className="break-all hover:text-[#E55A2B] transition-colors duration-200 cursor-pointer"
                                        title="Click to send email"
                                    >
                                        debbiekrysb@gmail.com
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Facebook className="w-5 h-5 text-[#E55A2B] flex-shrink-0" />
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

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    href='/guest-bookings/create'
                                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-[#E55A2B] border border-[#E55A2B] rounded-md hover:bg-[#D14D24] hover:border-[#D14D24] active:bg-[#B8421F] transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Book Now
                                </Link>
                                <Link
                                    href='#'
                                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-[#1F5F5B] bg-transparent border border-[#D4B896] rounded-md hover:border-[#C3A277] hover:bg-[#EBE6D8] transition-all duration-200"
                                >
                                    View Gallery
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
