'use client';

import { OutlinedFieldsContext } from '@/components/ui/outlined-text-field';

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OutlinedFieldsContext.Provider value={true}>
      {children}
    </OutlinedFieldsContext.Provider>
  );
}
