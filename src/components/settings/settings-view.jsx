"use client";

import * as React from "react";
import {
  User,
  Lock,
  Bell,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export function SettingsView({ initialUser }) {
  const [activeTab, setActiveTab] = React.useState("profile");
  const [user, setUser] = React.useState(
    initialUser || {
      name: "Alex Carter",
      email: "alex.carter@enterprise.ai",
      image: null,
      role: "CLIENT",
    }
  );

  // Profile Form State
  const [name, setName] = React.useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = React.useState(user?.image || "");
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  // Dirty check for Profile
  const isProfileDirty =
    name !== (user?.name || "") || avatarUrl !== (user?.image || "");

  // Password Form State
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordSaving, setPasswordSaving] = React.useState(false);

  // Notifications State
  const [notifs, setNotifs] = React.useState({
    emailTransactional: true,
    emailSecurity: true,
    emailMarketing: false,
    inAppEngagements: true,
    inAppMessages: true,
  });
  const [initialNotifs, setInitialNotifs] = React.useState({ ...notifs });
  const [notifsSaving, setNotifsSaving] = React.useState(false);

  const isNotifsDirty =
    JSON.stringify(notifs) !== JSON.stringify(initialNotifs);

  // Danger Zone State
  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  // Fetch initial preferences
  React.useEffect(() => {
    fetch("/api/settings/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.preferences) {
          const pref = {
            emailTransactional: data.preferences.emailTransactional ?? true,
            emailSecurity: data.preferences.emailSecurity ?? true,
            emailMarketing: data.preferences.emailMarketing ?? false,
            inAppEngagements: data.preferences.inAppEngagements ?? true,
            inAppMessages: data.preferences.inAppMessages ?? true,
          };
          setNotifs(pref);
          setInitialNotifs(pref);
        }
      })
      .catch(() => null);
  }, []);

  // Avatar file upload handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "avatars");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload failed");
      } else {
        setAvatarUrl(data.url);
        toast.success("Avatar uploaded. Save to apply.");
      }
    } catch {
      toast.error("Avatar upload failed.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setProfileSaving(true);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
      } else {
        toast.success("Profile saved successfully.");
        setUser((prev) => ({ ...prev, name, image: avatarUrl }));
      }
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDiscardProfile = () => {
    setName(user?.name || "");
    setAvatarUrl(user?.image || "");
  };

  // Change password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update password");
      } else {
        toast.success("Password updated successfully.");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Save notifications
  const handleSaveNotifs = async () => {
    setNotifsSaving(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: notifs }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save notifications");
      } else {
        toast.success("Notification preferences saved.");
        setInitialNotifs({ ...notifs });
      }
    } catch {
      toast.error("Failed to save notifications.");
    } finally {
      setNotifsSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Type DELETE to confirm");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/settings/delete-account", {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.href = "/login";
      } else {
        toast.error("Failed to delete account");
      }
    } catch {
      toast.error("An error occurred during account deletion.");
    } finally {
      setDeleting(false);
    }
  };

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security & Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      {/* Header */}
      <div className="border-b border-line pb-4">
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Account Settings
        </h1>
        <p className="text-xs text-ink-3">
          Manage your personal identity, credentials, and notification
          frequencies.
        </p>
      </div>

      {/* Two Column Layout: Left Sub-Nav + Right Form Area (520-640px) */}
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
        {/* Left Sub-Nav */}
        <aside className="space-y-1 md:col-span-4 lg:col-span-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  isActive
                    ? "shadow-2xs border border-line bg-panel text-ink"
                    : "text-ink-2 hover:bg-panel-2 hover:text-ink"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-brand-indigo" : "text-ink-3"}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Form Container (Constrained 520-640px) */}
        <div className="max-w-[620px] md:col-span-8 lg:col-span-9">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="shadow-2xs space-y-6 rounded-[14px] border border-line bg-panel p-6">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-ink">
                  Profile Details
                </h2>
                <p className="text-xs text-ink-3">
                  Your public name and avatar visible to collaborators.
                </p>
              </div>

              {/* Avatar Uploader */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-panel-2 text-sm font-bold text-brand-indigo">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    name.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <label className="btn-secondary-outline inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-semibold">
                    <Upload className="h-3.5 w-3.5" />
                    <span>
                      {uploadingAvatar ? "Uploading..." : "Change avatar"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-[11px] text-ink-3">
                    PNG, JPG or WebP up to 4MB.
                  </p>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus:outline-hidden w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs text-ink focus:ring-2 focus:ring-brand-indigo"
                  placeholder="e.g. Alex Carter"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink-3"
                />
                <p className="text-[11px] text-ink-3">
                  To change your primary email, contact customer support.
                </p>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="shadow-2xs space-y-6 rounded-[14px] border border-line bg-panel p-6">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-ink">
                  Security & Credentials
                </h2>
                <p className="text-xs text-ink-3">
                  Update your password to keep your account safe.
                </p>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs text-ink focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs text-ink focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving || !password}
                  className="btn-primary-indigo flex items-center gap-1.5 px-4 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  {passwordSaving && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="shadow-2xs space-y-6 rounded-[14px] border border-line bg-panel p-6">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-ink">
                  Notification Channels
                </h2>
                <p className="text-xs text-ink-3">
                  Choose when and how Loopwise alerts you.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-line">
                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="text-xs font-semibold text-ink">
                      Transactional Alerts
                    </div>
                    <div className="text-[11px] text-ink-3">
                      Escrow releases, contract milestone approvals
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.emailTransactional}
                    onChange={(e) =>
                      setNotifs({
                        ...notifs,
                        emailTransactional: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-line text-brand-indigo accent-[#4B3FD6]"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="text-xs font-semibold text-ink">
                      Security Alerts
                    </div>
                    <div className="text-[11px] text-ink-3">
                      New logins, API key changes, token renewals
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.emailSecurity}
                    onChange={(e) =>
                      setNotifs({ ...notifs, emailSecurity: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-line text-brand-indigo accent-[#4B3FD6]"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="text-xs font-semibold text-ink">
                      In-App Chat Messages
                    </div>
                    <div className="text-[11px] text-ink-3">
                      Immediate ping when client or strategist posts
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.inAppMessages}
                    onChange={(e) =>
                      setNotifs({ ...notifs, inAppMessages: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-line text-brand-indigo accent-[#4B3FD6]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DANGER ZONE TAB */}
          {activeTab === "danger" && (
            <div className="shadow-2xs space-y-6 rounded-[14px] border border-red-200 bg-panel p-6 dark:border-red-900/40">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-red-600 dark:text-red-400">
                  Danger Zone
                </h2>
                <p className="text-xs text-ink-3">
                  Permanently delete your account and decommission your agents.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-ink-2">
                  To confirm deletion, type <strong>DELETE</strong> in the box
                  below:
                </p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-lg border border-red-300 bg-panel-2 px-3 py-2 font-mono text-xs text-ink focus:ring-2 focus:ring-red-500 dark:border-red-900/60"
                />
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== "DELETE" || deleting}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40"
                >
                  {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Permanently Delete Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STICKY SAVE BAR ON DIRTY */}
      {(isProfileDirty || isNotifsDirty) && (
        <div className="shadow-warm animate-in fade-in slide-in-from-bottom-3 fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-line-2 bg-[#1B1A17] px-5 py-3 text-white duration-150 dark:bg-[#1C1A16]">
          <span className="text-xs font-semibold">
            You have unsaved changes
          </span>
          <div className="h-4 w-px bg-white/20" />
          <button
            type="button"
            onClick={
              activeTab === "profile"
                ? handleDiscardProfile
                : () => setNotifs({ ...initialNotifs })
            }
            className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-3 transition-colors hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Discard</span>
          </button>
          <button
            type="button"
            onClick={
              activeTab === "profile" ? handleSaveProfile : handleSaveNotifs
            }
            disabled={profileSaving || notifsSaving}
            className="shadow-xs flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-indigo px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-indigo-hover"
          >
            {(profileSaving || notifsSaving) && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            <Save className="h-3.5 w-3.5" />
            <span>Save changes</span>
          </button>
        </div>
      )}
    </div>
  );
}
