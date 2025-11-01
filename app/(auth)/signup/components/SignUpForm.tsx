// import Link from "next/link";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { signup } from "@/lib/auth-actions";

// export function SignUpForm() {
//   return (
//     <Card className="mx-auto max-w-sm">
//       <CardHeader>
//         <CardTitle className="text-xl">Zarejestruj się</CardTitle>
//         <CardDescription>
//           Podaj swoje informacje aby się stworzyć konto
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form action="">
//           <div className="grid gap-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="first-name">Imię</Label>
//                 <Input
//                   name="first-name"
//                   id="first-name"
//                   placeholder="Max"
//                   required
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="last-name">Nazwisko</Label>
//                 <Input
//                   name="last-name"
//                   id="last-name"
//                   placeholder="Robinson"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="email">E-mail</Label>
//               <Input
//                 name="email"
//                 id="email"
//                 type="email"
//                 placeholder="m@example.com"
//                 required
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="password">Hasło</Label>
//               <Input name="password" id="password" type="password" />
//             </div>
//             <Button formAction={signup} type="submit" className="w-full">
//               Zarejestruj się
//             </Button>
//           </div>
//         </form>
//         <div className="mt-4 text-center text-sm">
//           Masz konto?{" "}
//           <Link href="/login" className="underline">
//             Zaloguj się
//           </Link>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInWithGoogle, signup } from "@/lib/auth-actions";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Zarejestruj się</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => signInWithGoogle()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Zarejestruj przez Google
                </Button>
              </Field>
              <Separator />
              <Field>
                <FieldLabel>Imię</FieldLabel>
                <Input
                  name="first-name"
                  id="first-name"
                  placeholder="Max"
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Nazwisko</FieldLabel>
                <Input
                  name="last-name"
                  id="last-name"
                  placeholder="Max"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@gmail.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Hasło</FieldLabel>
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit" formAction={signup}>
                  Zarejestruj się
                </Button>
                <FieldDescription className="text-center">
                  Masz konto? <Link href="/login">Zaloguj się</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <Link href="#">Privacy Policy</Link>. Tutaj trzeba zmienić na Polski
      </FieldDescription>
    </div>
  );
}
