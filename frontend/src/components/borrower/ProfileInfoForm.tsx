import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { borrowerApi, ApiError } from "@/lib/api";

export function ProfileInfoForm() {
  const { session } = useUser();
  const [name, setName] = useState(session?.name ?? "");
  const [email] = useState(session?.email ?? "");
  const [phone, setPhone] = useState(session?.phoneNumber ?? "+1 (555) 012-9842");
  const [language, setLanguage] = useState("English (UK)");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.borrowerId) return;
    setSaving(true);
    setError(null);
    try {
      await borrowerApi.updateProfile(session.borrowerId, {
        name: name !== session?.name ? name : undefined,
        phoneNumber: phone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass-panel p-8 md:p-12 rounded-3xl">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Personal Information</h2>
          <p className="text-on-surface-variant font-body-md">
            Manage your public identity and administrative contact details.
          </p>
        </div>
        <span className="px-4 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-label-sm font-semibold uppercase tracking-wider">
          Official Profile
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-8">
        <Field label="Full Legal Name" value={name} onChange={setName} />
        <Field label="Institutional Email" value={email} onChange={() => {}} disabled />
        <Field label="Phone Number" value={phone} onChange={setPhone} />
        <div className="flex flex-col gap-2">
          <label className="font-subhead-caps text-subhead-caps text-on-surface-variant uppercase">Preferred Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary appearance-none cursor-pointer"
          >
            <option>English (UK)</option>
            <option>English (US)</option>
            <option>Japanese (Nihongo)</option>
            <option>Swiss German</option>
          </select>
        </div>

        <div className="md:col-span-2 pt-4 flex items-center gap-4">
          {error && (
            <p className="text-error text-sm font-body flex-1">{error}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-body-md font-semibold hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Information"}
          </button>
          {saved && (
            <span className="text-secondary font-body-md font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Changes saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-subhead-caps text-subhead-caps text-on-surface-variant uppercase">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-primary disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}
