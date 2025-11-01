import React from "react";
import { SignUpForm } from "./components/SignUpForm";
import { Building } from "lucide-react";

const SignUpPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
