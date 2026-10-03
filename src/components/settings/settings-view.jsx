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
} from "lucide-react";
import { PageHeader, ContentContainer } from "@/components/layout/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function SettingsView({ initialUser }) {
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
  const [profileMessage, setProfileMessage] = React.useState(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  // Password Form State
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState(null);

  // Notifications State
  const [notifs, setNotifs] = React.useState({
    emailTransactional: true,
    emailSecurity: true,
    emailMarketing: false,
    inAppEngagements: true,
    inAppMessages: true,
  });
  const [notifsSaving, setNotifsSaving] = React.useState(false);

  // Danger Zone State
  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  // Fetch initial preferences
  React.useEffect(() => {
    fetch("/api/settings/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.preferences) {
          setNotifs({
            emailTransactional: data.preferences.emailTransactional ?? true,
            emailSecurity: data.preferences.emailSecurity ?? true,
            emailMarketing: data.preferences.emailMarketing ?? false,
            inAppEngagements: data.preferences.inAppEngagements ?? true,
            inAppMessages: data.preferences.inAppMessages ?? true,
          });
        }
      })
      .catch(() => null);
  }, []);

  // Avatar file upload handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setProfileMessage(null);

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
        setProfileMessage({
          type: "error",
          text: data.error || "Upload failed",
        });
      } else {
        setAvatarUrl(data.url);
        setProfileMessage({
          type: "success",
          text: "Avatar uploaded. Click Save to apply.",
        });
      }
    } catch {
      setProfileMessage({ type: "error", text: "Avatar upload failed." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMessage({
          type: "error",
          text: data.error || "Failed to update profile",
        });
      } else {
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully.",
        });
        setUser((prev) => ({ ...prev, name, image: avatarUrl }));
      }
    } catch {
      setProfileMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  // Save password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage(null);

    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMessage({
          type: "error",
          text: data.error || "Failed to change password",
        });
      } else {
        setPasswordMessage({
          type: "success",
          text: "Password changed successfully.",
        });
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Failed to change password." });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Toggle notification preference
  const handleToggleNotif = async (key, value) => {
    const updated = { ...notifs, [key]: value };
    setNotifs(updated);
    setNotifsSaving(true);

    try {
      await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch (err) {
      console.error("Failed to update notification pref:", err);
    } finally {
      setNotifsSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/settings/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirm }),
      });
      if (res.ok) {
        window.location.href = "/login";
      } else {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete account");
        setDeleting(false);
      }
    } catch {
      setDeleteError("An unexpected error occurred");
      setDeleting(false);
    }
  };

  return (
    <ContentContainer size="default">
      <PageHeader
        title="Account Settings"
        description="Manage your identity, authentication credentials, and notification preferences."
        badge={<Badge variant="outline">{user?.role || "USER"}</Badge>}
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="border border-border-hairline bg-surface-raised p-1">
          <TabsTrigger value="profile" className="gap-2 text-xs">
            <User className="h-3.5 w-3.5" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs">
            <Lock className="h-3.5 w-3.5" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs">
            <Bell className="h-3.5 w-3.5" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="danger"
            className="gap-2 text-xs text-semantic-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Danger Zone</span>
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card raised className="border-border-hairline">
            <CardHeader className="border-b border-border-hairline pb-4">
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>
                Update your public name and workspace avatar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {profileMessage && (
                <div
                  className={`flex items-center gap-2 rounded-md p-3 text-xs ${
                    profileMessage.type === "success"
                      ? "border-semantic-success/30 bg-semantic-success/10 border text-semantic-success"
                      : "border-semantic-danger/30 bg-semantic-danger/10 border text-semantic-danger"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              {/* Avatar Uploader */}
              <div className="flex items-center gap-4">
                <Avatar
                  src={avatarUrl}
                  fallback={(name || "U").slice(0, 2).toUpperCase()}
                  size="lg"
                  className="h-16 w-16"
                />
                <div className="space-y-1.5">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border-hairline bg-surface-raised px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-highlight">
                    {uploadingAvatar ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                  <p className="text-2xs text-text-muted">
                    JPEG, PNG, or WebP. Maximum 5MB.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="max-w-md space-y-4">
                <div className="space-y-1.5">
                  <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-surface-base/50 cursor-not-allowed text-text-muted"
                  />
                  <span className="text-2xs text-text-muted">
                    Email cannot be changed directly. Contact support for
                    assistance.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={profileSaving}
                  className="gap-2"
                >
                  {profileSaving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span>Save Profile</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card raised className="border-border-hairline">
            <CardHeader className="border-b border-border-hairline pb-4">
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>
                Ensure your account uses a secure password of at least 8
                characters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {passwordMessage && (
                <div
                  className={`flex items-center gap-2 rounded-md p-3 text-xs ${
                    passwordMessage.type === "success"
                      ? "border-semantic-success/30 bg-semantic-success/10 border text-semantic-success"
                      : "border-semantic-danger/30 bg-semantic-danger/10 border text-semantic-danger"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form
                onSubmit={handleSavePassword}
                className="max-w-md space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={passwordSaving}
                  className="gap-2"
                >
                  {passwordSaving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span>Update Password</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <Card raised className="border-border-hairline">
            <CardHeader className="border-b border-border-hairline pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure email digests, security notifications, and in-app
                    updates.
                  </CardDescription>
                </div>
                {notifsSaving && (
                  <Badge variant="outline" size="xs" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border-hairline p-0">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs font-semibold text-text-primary">
                    Transactional Emails
                  </div>
                  <div className="text-2xs text-text-muted">
                    Contract signings, milestone approvals, and invoice
                    receipts.
                  </div>
                </div>
                <Switch
                  checked={notifs.emailTransactional}
                  onCheckedChange={(val) =>
                    handleToggleNotif("emailTransactional", val)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs font-semibold text-text-primary">
                    Security & Auth Alerts
                  </div>
                  <div className="text-2xs text-text-muted">
                    New device logins, password resets, and session alerts.
                  </div>
                </div>
                <Switch
                  checked={notifs.emailSecurity}
                  onCheckedChange={(val) =>
                    handleToggleNotif("emailSecurity", val)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs font-semibold text-text-primary">
                    In-App Engagement Updates
                  </div>
                  <div className="text-2xs text-text-muted">
                    Live updates when agent deliverables and proposals are
                    ready.
                  </div>
                </div>
                <Switch
                  checked={notifs.inAppEngagements}
                  onCheckedChange={(val) =>
                    handleToggleNotif("inAppEngagements", val)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs font-semibold text-text-primary">
                    Direct Messages
                  </div>
                  <div className="text-2xs text-text-muted">
                    Instant alerts when strategists or clients ping you in
                    active threads.
                  </div>
                </div>
                <Switch
                  checked={notifs.inAppMessages}
                  onCheckedChange={(val) =>
                    handleToggleNotif("inAppMessages", val)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs font-semibold text-text-primary">
                    Marketing & Intelligence Digests
                  </div>
                  <div className="text-2xs text-text-muted">
                    Bi-weekly benchmarks on autonomous agent ROI and marketplace
                    trends.
                  </div>
                </div>
                <Switch
                  checked={notifs.emailMarketing}
                  onCheckedChange={(val) =>
                    handleToggleNotif("emailMarketing", val)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DANGER ZONE TAB */}
        <TabsContent value="danger">
          <Card raised className="border-semantic-danger/30">
            <CardHeader className="border-semantic-danger/20 border-b pb-4">
              <CardTitle className="text-base text-semantic-danger">
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account, contracts, and all associated
                organization data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {deleteError && (
                <div className="border-semantic-danger/30 bg-semantic-danger/10 flex items-center gap-2 rounded-md border p-3 text-xs text-semantic-danger">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <p className="text-xs text-text-secondary">
                This action is non-reversible. Please type{" "}
                <span className="font-mono font-bold text-semantic-danger">
                  DELETE
                </span>{" "}
                to confirm.
              </p>

              <div className="max-w-md space-y-3">
                <Input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="border-semantic-danger/40 focus:border-semantic-danger"
                />

                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirm !== "DELETE"}
                  className="gap-2"
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Permanently Delete My Account</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ContentContainer>
  );
}
