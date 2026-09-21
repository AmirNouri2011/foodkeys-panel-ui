import {AuthProvider, useAuth} from '@/context/AuthContext';
import {inter, lexendDeca} from '@/app/fonts';
import GlobalDrawer from '@/app/shared/drawer-views/container';
import GlobalModal from '@/app/shared/modal-views/container';
import {ThemeProvider} from '@/app/shared/theme-provider';
import {siteConfig} from '@/config/site.config';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';
import {Toaster} from 'react-hot-toast';

const NextProgress = dynamic(() => import('@/components/next-progress'), {
    ssr: false,
});
// styles
import '@/app/globals.css';

export const metadata = {
    title: siteConfig.title,
    description: siteConfig.description,
    viewport: {width: 'device-width', initialScale: 1},
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    // const session = await getServerSession(authOptions);
    // const { state } = await useAuth()
    return (
        <html
            lang="fa"
            dir="rtl"
            // required this one for next-themes, remove it if you are not using next-theme
            suppressHydrationWarning
        >
        <body
            // to prevent any warning that is caused by third party extensions like Grammarly
            suppressHydrationWarning
            className={`${cn(
                inter.variable,
                lexendDeca.variable,
                'font-inter'
            )} font-iransans`}
        >
        <AuthProvider>
            <ThemeProvider>
                    <NextProgress/>
                    {children}
                    <Toaster position="top-center" reverseOrder={true} toastOptions={{duration: 4000}}/>
                    <GlobalDrawer/>
                    <GlobalModal/>
            </ThemeProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
