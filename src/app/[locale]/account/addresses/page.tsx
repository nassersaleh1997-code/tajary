import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressForm } from "@/components/account/AddressForm";
import { DeleteAddressButton } from "@/components/account/DeleteAddressButton";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ar/auth/login");

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="container-custom py-8">
      <h1 className="mb-6 text-2xl font-bold">عناويني</h1>

      <div className="mb-8">
        <AddressForm />
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border bg-white py-12 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">لا توجد عناوين محفوظة</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-2xl border bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">{a.label}</span>
                {a.isDefault && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    افتراضي
                  </span>
                )}
              </div>
              <p className="text-sm">{a.name} • {a.phone}</p>
              <p className="text-sm text-muted-foreground">
                {a.address}
                {a.district && `، ${a.district}`}
                {`، ${a.city}`}
              </p>
              <div className="mt-3">
                <DeleteAddressButton id={a.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
