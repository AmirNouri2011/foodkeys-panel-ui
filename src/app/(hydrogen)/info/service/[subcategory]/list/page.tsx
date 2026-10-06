import { redirect } from 'next/navigation';

export default function LegacyServiceListPage({
  params,
}: {
  params: { subcategory: string };
}) {
  redirect(`/info/service/${encodeURIComponent(params.subcategory)}/create`);
}
