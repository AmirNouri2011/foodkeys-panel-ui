import SubscriptionCheckout from '@/app/shared/bundle/subscription-checkout';

export default function BuyBundlePage({ params }: { params: { id: string } }) {
  return <SubscriptionCheckout id={params.id} />;
}
