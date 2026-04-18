"use client";

import { useUser } from "@/hooks/useUser";
import { auth } from "@/lib/firebase";

export default function ProfilePage() {
  const { profile, loading } = useUser();

  if (loading) {
     return (
        <div className="flex-1 flex items-center justify-center pt-32">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </div>
     );
  }

  const handleLogout = () => {
    auth.signOut();
    window.location.href = "/login";
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="pt-24 px-4 max-w-4xl mx-auto space-y-8 pb-32">
      {/* Profile Header */}
      <section className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden group shadow-[0_8px_32px_rgba(1,45,29,0.04)]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-container/10 opacity-50 z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-lg bg-surface-container">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant w-full h-full flex items-center justify-center">person</span>
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-1">{profile?.name || "Volunteer"}</h1>
            <p className="font-body text-primary-container font-semibold mb-2 text-lg">
               {isAdmin ? "Senior Field Director" : `Volunteer Field Agent (#${profile?.volunteerId || "001"})`}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-on-surface-variant font-medium">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">mail</span> {profile?.email || "volunteer@trustfeed.org"}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">location_on</span> {isAdmin ? "Global Admin" : "Field Operative"}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-primary text-on-primary px-6 py-3 rounded-xl font-bold font-label hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(1,45,29,0.15)]">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span> Edit
            </button>
            <button onClick={handleLogout} className="flex-1 md:flex-none bg-error text-on-error px-6 py-3 rounded-xl font-bold font-label hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span> Logout
            </button>
          </div>
        </div>
      </section>

      {/* Conditional Dashboard Section */}
      {isAdmin ? (
        <>
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Admin Overview</h2>
              <span className="bg-tertiary-container/20 text-tertiary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-label">Real-time</span>
            </div>
            
            {/* Bento Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-container-low rounded-xl p-5 hover:bg-surface-container transition-colors duration-300 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 text-primary">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="material-symbols-outlined text-primary text-2xl">public</span>
                  <span className="text-xs font-bold text-tertiary flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">trending_up</span> +12%</span>
                </div>
                <div className="relative z-10">
                  <p className="font-label text-sm text-on-surface-variant mb-1 font-medium">Active Projects</p>
                  <h3 className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">47</h3>
                </div>
              </div>

              <div className="bg-primary text-on-primary rounded-xl p-5 relative overflow-hidden shadow-[0_8px_32px_rgba(1,45,29,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-90"></div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="material-symbols-outlined text-on-primary text-2xl">groups</span>
                  <span className="text-xs font-bold text-tertiary-fixed flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">arrow_drop_up</span> +5 new</span>
                </div>
                <div className="relative z-10">
                  <p className="font-label text-sm text-primary-fixed-dim mb-1 font-medium">Field Personnel</p>
                  <h3 className="font-headline text-4xl font-extrabold tracking-tighter">1,204</h3>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-5 hover:bg-surface-container transition-colors duration-300 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 text-primary">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="material-symbols-outlined text-primary text-2xl">description</span>
                  <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(116,91,0,0.5)]"></span>
                </div>
                <div className="relative z-10">
                  <p className="font-label text-sm text-on-surface-variant mb-1 font-medium">Pending Reports</p>
                  <h3 className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter">14</h3>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-6">
              <h3 className="font-headline text-xl font-bold text-on-surface mb-6 tracking-tight">Administrative Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors active:scale-[0.98] duration-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                    </div>
                    <span className="font-body font-semibold text-on-surface">Onboard New Personnel</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-tertiary-container/10 rounded-lg hover:bg-tertiary-container/20 transition-colors active:scale-[0.98] duration-200 border border-tertiary-container/30">
                  <div className="flex items-center gap-4">
                    <div className="bg-tertiary/20 p-2 rounded-lg text-tertiary">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>approval</span>
                    </div>
                    <span className="font-body font-semibold text-tertiary">Review Field Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-tertiary text-on-tertiary text-xs font-bold px-2 py-1 rounded-full">14 Pending</span>
                    <span className="material-symbols-outlined text-tertiary">chevron_right</span>
                  </div>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors active:scale-[0.98] duration-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined text-[20px]">security</span>
                    </div>
                    <span className="font-body font-semibold text-on-surface">Security Protocols</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
              </div>
            </section>
            
            <section className="bg-surface-container-low rounded-xl p-6">
              <h3 className="font-headline text-xl font-bold text-on-surface mb-6 tracking-tight">Credentials & Specializations</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-surface-container-lowest border border-outline-variant/15 px-4 py-2 rounded-full text-sm font-semibold text-on-surface shadow-sm">Crisis Management</span>
                <span className="bg-surface-container-lowest border border-outline-variant/15 px-4 py-2 rounded-full text-sm font-semibold text-on-surface shadow-sm">Logistics</span>
                <span className="bg-surface-container-lowest border border-outline-variant/15 px-4 py-2 rounded-full text-sm font-semibold text-on-surface shadow-sm">Negotiation</span>
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold shadow-sm">Advanced First Aid</span>
                <span className="bg-surface-container-lowest border border-outline-variant/15 px-4 py-2 rounded-full text-sm font-semibold text-on-surface shadow-sm">Bilingual (FR/EN)</span>
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Volunteer Specific Sections */}
            <section className="bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-6">
              <h3 className="font-headline text-xl font-bold text-on-surface mb-6 tracking-tight">Community Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors active:scale-[0.98] duration-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-tertiary-container/20 p-2 rounded-lg text-tertiary">
                      <span className="material-symbols-outlined text-[20px]">history</span>
                    </div>
                    <span className="font-body font-semibold text-on-surface">My Upload History</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors active:scale-[0.98] duration-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined text-[20px]">help_center</span>
                    </div>
                    <span className="font-body font-semibold text-on-surface">Field Support Guidelines</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
              </div>
            </section>
            
            <section className="bg-surface-container-low rounded-xl p-6">
              <h3 className="font-headline text-xl font-bold text-on-surface mb-6 tracking-tight">Active Specializations</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-surface-container-lowest border border-outline-variant/15 px-4 py-2 rounded-full text-sm font-semibold text-on-surface shadow-sm">Community Outreach</span>
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold shadow-sm">Basic First Aid</span>
                <span className="bg-surface-container-lowest border border-outline-variant/15 px-4 py-2 rounded-full text-sm font-semibold text-on-surface shadow-sm">Photography</span>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/15">
                <h4 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Current Deployment</h4>
                <div className="bg-surface-container-highest rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <p className="font-body font-medium text-on-surface relative z-10">Assigned to Local District Field Operations. Currently tracking daily educational metrics.</p>
                </div>
              </div>
            </section>
        </div>
      )}
    </div>
  );
}

