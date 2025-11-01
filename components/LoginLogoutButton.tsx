"use client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { signout } from "@/lib/auth-actions";
import { useUser } from "@/hooks/use-user";

const LoginButton = () => {
  const { user } = useUser();
  const router = useRouter();

  if (user) {
    return (
      <Button
        onClick={() => {
          signout();
        }}
      >
        Log out
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      onClick={() => {
        router.push("/login");
      }}
    >
      Login
    </Button>
  );
};

export default LoginButton;
