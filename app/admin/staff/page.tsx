import {
  addStaffAccessAction,
  setStaffAccessActiveAction,
  updateStaffDisplayNameAction,
} from "@/app/admin/staff/actions";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { getStaffAccessList } from "@/lib/admin-staff";
import { requireAdmin } from "@/lib/auth/require-admin";

type AdminStaffPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminStaffPage({
  searchParams,
}: AdminStaffPageProps) {
  await requireAdmin();

  const [{ error, saved }, staff] = await Promise.all([
    searchParams,
    getStaffAccessList(),
  ]);

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-5xl px-5 py-6">
        <SectionHeader
          eyebrow="ADMIN ONLY"
          title="Staff Access"
          description="Control which existing Supabase Auth accounts can use the JuneRose staff area."
        />

        {saved && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {saved}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        <section className="mt-8 border-b border-[#d6c4aa] pb-8">
          <h2 className="text-lg font-semibold">Add staff access</h2>
          <p className="mt-2 text-sm leading-6 text-[#6f6258]">
            The person must already have a Supabase Auth account. New access is
            always created with the staff role.
          </p>

          <form
            action={addStaffAccessAction}
            className="mt-5 grid max-w-4xl gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <label className="grid gap-2 text-sm">
              Display name
              <input
                name="displayName"
                type="text"
                required
                maxLength={80}
                autoComplete="off"
                className="min-h-11 rounded-lg border border-[#bca58a] bg-white px-3 py-2 outline-none focus:border-[#7d6040]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Staff email
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="off"
                className="min-h-11 rounded-lg border border-[#bca58a] bg-white px-3 py-2 outline-none focus:border-[#7d6040]"
              />
            </label>

            <button
              type="submit"
              className="min-h-11 rounded-lg bg-[#2f241c] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a392c]"
            >
              Add staff
            </button>
          </form>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Authorized accounts</h2>

          <div className="mt-5 overflow-x-auto border-y border-[#d6c4aa]">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-[#efe5d7] text-xs uppercase text-[#6f6258]">
                <tr>
                  <th className="px-4 py-3 font-medium">Display name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last sign-in</th>
                  <th className="px-4 py-3 text-right font-medium">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4d7c6] bg-[#fbf7f0]">
                {staff.map((member) => (
                  <tr key={member.userId}>
                    <td className="px-4 py-4">
                      <form
                        action={updateStaffDisplayNameAction}
                        className="flex min-w-56 gap-2"
                      >
                        <input
                          type="hidden"
                          name="userId"
                          value={member.userId}
                        />
                        <input
                          name="displayName"
                          type="text"
                          required
                          maxLength={80}
                          defaultValue={member.displayName ?? ""}
                          placeholder="Name not set"
                          aria-label={`Display name for ${member.email}`}
                          className="min-h-10 min-w-0 flex-1 rounded-lg border border-[#cbb79e] bg-white px-3 py-2"
                        />
                        <button
                          type="submit"
                          className="min-h-10 border border-[#9f876d] px-3 font-medium hover:bg-white"
                        >
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-4 font-medium">{member.email}</td>
                    <td className="px-4 py-4 capitalize">{member.role}</td>
                    <td className="px-4 py-4">
                      {member.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="px-4 py-4 text-[#6f6258]">
                      {formatDate(member.lastSignInAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {member.role === "admin" ? (
                        <span className="text-xs font-medium text-[#8a7a6d]">
                          Protected
                        </span>
                      ) : (
                        <form action={setStaffAccessActiveAction}>
                          <input
                            type="hidden"
                            name="userId"
                            value={member.userId}
                          />
                          <input
                            type="hidden"
                            name="nextIsActive"
                            value={member.isActive ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className={
                              member.isActive
                                ? "font-medium text-red-800 hover:text-red-950"
                                : "font-medium text-green-800 hover:text-green-950"
                            }
                          >
                            {member.isActive ? "Deactivate" : "Reactivate"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
