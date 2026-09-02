"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/seperator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validators/auth";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

interface AccountSettingsProps {
  initialProfile: {
    name: string;
    email: string;
    phone: string;
  };
  hasPassword: boolean;
  providers: string[];
}

export function AccountSettings({ initialProfile, hasPassword, providers }: AccountSettingsProps) {
  const router = useRouter();

  // Profile form
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialProfile.name,
      phone: initialProfile.phone,
    },
  });

  async function onProfileSubmit(data: ProfileInput) {
    setProfileSaving(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setProfileMsg({ type: "success", text: "Profile updated successfully." });
      router.refresh();
    } catch {
      setProfileMsg({ type: "error", text: "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  }

  // Password form
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onPasswordSubmit(data: ChangePasswordInput) {
    setPasswordSaving(true);
    setPasswordMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error?.message || "Failed to update password");
      }

      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      passwordForm.reset();
    } catch (err) {
      setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update password." });
    } finally {
      setPasswordSaving(false);
    }
  }

  // Delete account
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/profile", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      {/* Personal Info */}
      <Card>
        <CardContent className="py-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="settings-name">Full Name</Label>
              <Input
                id="settings-name"
                {...profileForm.register("name")}
                className={profileForm.formState.errors.name ? "border-red-500" : ""}
              />
              {profileForm.formState.errors.name && (
                <p className="mt-1 text-xs text-red-600">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Input value={initialProfile.email} disabled className="bg-muted" />
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Email cannot be changed.
                {providers.includes("google") && " Linked with Google."}
              </p>
            </div>

            <div>
              <Label htmlFor="settings-phone">Phone</Label>
              <Input
                id="settings-phone"
                type="tel"
                {...profileForm.register("phone")}
              />
            </div>

            {profileMsg.text && (
              <p className={`text-sm ${profileMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>
                {profileMsg.text}
              </p>
            )}

            <Button type="submit" disabled={profileSaving}>
              {profileSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      {hasPassword && (
        <Card>
          <CardContent className="py-4">
            <h2 className="text-lg font-semibold">Change Password</h2>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="current-pw">Current Password</Label>
                <Input
                  id="current-pw"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register("currentPassword")}
                  className={passwordForm.formState.errors.currentPassword ? "border-red-500" : ""}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="new-pw">New Password</Label>
                <Input
                  id="new-pw"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("newPassword")}
                  className={passwordForm.formState.errors.newPassword ? "border-red-500" : ""}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirm-pw">Confirm New Password</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirmPassword")}
                  className={passwordForm.formState.errors.confirmPassword ? "border-red-500" : ""}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {passwordMsg.text && (
                <p className={`text-sm ${passwordMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>
                  {passwordMsg.text}
                </p>
              )}

              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardContent className="py-4">
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">
            This will permanently delete your account and order history.
          </p>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" className="mt-3" />}
            >
              Delete Account
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account, order history, addresses, and wishlist.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Yes, Delete My Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}