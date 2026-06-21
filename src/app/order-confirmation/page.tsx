"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
      <h1 className="text-4xl font-display font-light text-charcoal mb-4">
        Thank You for Your Order
      </h1>
      <p className="text-muted mb-2">
        Your order has been confirmed and is being prepared.
      </p>
      {orderNumber && (
        <p className="text-charcoal font-medium mb-8">
          Order Number: <span className="text-gold">{orderNumber}</span>
        </p>
      )}
      <p className="text-sm text-muted mb-10">
        A confirmation email will be sent to your inbox shortly.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/shop"
          className="bg-charcoal text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/account"
          className="border border-charcoal/20 px-8 py-3 text-sm tracking-widest uppercase hover:border-gold hover:text-gold transition-colors"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
