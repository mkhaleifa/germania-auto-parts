import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forget-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Germaina Auto Parts account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}