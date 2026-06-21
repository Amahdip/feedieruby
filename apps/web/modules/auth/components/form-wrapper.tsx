import Link from "next/link";
import { Logo } from "@/modules/ui/components/logo";
import { StudioCredit } from "@/modules/ui/components/studio-credit";

interface FormWrapperProps {
  children: React.ReactNode;
}

export const FormWrapper = ({ children }: FormWrapperProps) => {
  return (
    <div className="mx-auto flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div className="mx-auto w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl lg:w-96">
        <div className="mb-8 flex justify-center">
          <Link
            href="/auth/login"
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
            <Logo />
          </Link>
        </div>
        {children}
      </div>
      <div className="mx-auto mt-6 w-full max-w-sm lg:w-96">
        <StudioCredit />
      </div>
    </div>
  );
};
