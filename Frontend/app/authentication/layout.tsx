import ReturnButtons from "@/components/return-buttons";
import Link from "next/link";

const Authlayout = ({ children }: { children: React.ReactNode }) => {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl mt-12">
        <ReturnButtons />
        {children}
        <div className="mt-6 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          By clicking continue, you agree to our{" "}
          <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
};

export default Authlayout;
