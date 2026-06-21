import { Toaster } from "react-hot-toast";
import { FeedieRubyMark } from "@/modules/ui/components/feedieruby-brand";

export const SetupLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster />
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div
          style={{ scrollbarGutter: "stable both-edges" }}
          className="flex max-h-[90vh] w-[40rem] flex-col items-center gap-y-4 overflow-auto rounded-lg border bg-white p-12 text-center shadow-md">
          <div className="flex size-20 items-center justify-center rounded-lg bg-slate-900 p-3">
            <FeedieRubyMark className="max-w-none" />
          </div>
          {children}
        </div>
      </div>
    </>
  );
};
