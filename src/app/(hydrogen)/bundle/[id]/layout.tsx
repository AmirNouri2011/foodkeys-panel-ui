'use client';

import { usePathname } from 'next/navigation';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import ProfileSettingsNav from '@/app/shared/bundle/navigation';

export default function ProfileSettingsLayout({
  params,
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.endsWith('/buy')) return <>{children}</>;
  const pageHeader = {
    title: 'مدیریت اشتراک',
    breadcrumb: [
      {
        href: '/',
        name: 'خانه',
      },
      {
        href: routes.bundle(Number(params.id)),
        name: 'مدیریت اشتراک',
      },
    ],
  };
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ProfileSettingsNav id={params?.id} />
      {children}
    </>
  );
}
