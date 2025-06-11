import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MobileDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  trigger?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const MobileDialog = React.forwardRef<
  React.ElementRef<typeof Dialog>,
  MobileDialogProps
>(({ trigger, title, children, className, ...props }, ref) => {
  return (
    <Dialog {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        ref={ref}
        className={cn(
          "fixed bottom-0 left-0 right-0 top-auto h-[90vh] max-h-[90vh] rounded-t-xl border-t p-0 sm:top-1/2 sm:h-auto sm:max-h-[85vh] sm:rounded-lg sm:border sm:p-6",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {title && (
            <DialogHeader className="px-6 pt-6 sm:px-0 sm:pt-0">
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          )}
          <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-0">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

MobileDialog.displayName = "MobileDialog";

export { MobileDialog }; 