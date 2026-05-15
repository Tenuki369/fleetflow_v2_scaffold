import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <main className="min-h-screen grid place-items-center px-6 py-12">
      <SignUp />
    </main>
  );
}
