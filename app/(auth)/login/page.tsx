import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col ">
        <LoginForm />
      </div>
    </div>
  );
}
