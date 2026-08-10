import Image from "next/image";
import AdminShell from "@/components/AdminShell";
import AdminStorefrontImageUploadForm from "@/components/AdminStorefrontImageUploadForm";
import {
  removeStorefrontHeroAction,
  updateStorefrontContentAction,
} from "@/app/admin/storefront/actions";
import { getAdminStorefront } from "@/lib/admin-storefront";

type AdminStorefrontPageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

export default async function AdminStorefrontPage({
  searchParams,
}: AdminStorefrontPageProps) {
  const [settings, message] = await Promise.all([
    getAdminStorefront(),
    searchParams,
  ]);

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <p className="text-sm tracking-[0.25em] text-[#9c7a4f]">STAFF AREA</p>
        <h1 className="mt-3 text-2xl font-semibold">Storefront Appearance</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6258]">
          Manage the homepage hero image and its public text without changing code.
        </p>

        {message.saved && (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {message.saved}
          </p>
        )}
        {message.error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {message.error}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
            <h2 className="text-lg font-medium">Hero preview</h2>
            <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-xl bg-[#eadfce]">
              {settings.heroImageUrl ? (
                <Image
                  src={settings.heroImageUrl}
                  alt="Current storefront hero"
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#8a7a6d]">
                  No custom image. The homepage currently uses the first published product image.
                </div>
              )}
            </div>
            <AdminStorefrontImageUploadForm />

            {settings.heroImageUrl && (
              <form action={removeStorefrontHeroAction} className="mt-4">
                <button
                  type="submit"
                  className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Remove custom image
                </button>
              </form>
            )}
          </section>

          <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
            <h2 className="text-lg font-medium">Hero text</h2>
            <form action={updateStorefrontContentAction} className="mt-5 grid gap-5">
              <label className="grid gap-2 text-sm font-medium">
                Title
                <input
                  name="heroTitle"
                  required
                  minLength={3}
                  maxLength={120}
                  defaultValue={settings.heroTitle}
                  className="rounded-xl border border-[#d6c4aa] bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Supporting text
                <textarea
                  name="heroDescription"
                  required
                  minLength={3}
                  maxLength={240}
                  rows={5}
                  defaultValue={settings.heroDescription}
                  className="resize-y rounded-xl border border-[#d6c4aa] bg-white px-4 py-3 text-sm leading-6"
                />
              </label>
              <button
                type="submit"
                className="w-fit rounded-xl bg-[#2f241d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a382c]"
              >
                Save hero text
              </button>
            </form>
            <p className="mt-6 text-xs text-[#8a7a6d]">
              Last updated {new Date(settings.updatedAt).toLocaleString()}.
            </p>
          </section>
        </div>
      </section>
    </AdminShell>
  );
}
