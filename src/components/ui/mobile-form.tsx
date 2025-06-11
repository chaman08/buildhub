import * as React from "react";
import { cn } from "@/lib/utils";

interface MobileFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

const MobileForm = React.forwardRef<HTMLFormElement, MobileFormProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(
          "flex flex-col gap-4",
          "sm:gap-6",
          className
        )}
        {...props}
      >
        {children}
      </form>
    );
  }
);

MobileForm.displayName = "MobileForm";

interface MobileFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const MobileFormField = React.forwardRef<HTMLDivElement, MobileFormFieldProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-2",
          "sm:gap-3",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MobileFormField.displayName = "MobileFormField";

interface MobileFormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

const MobileFormLabel = React.forwardRef<HTMLLabelElement, MobileFormLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          "sm:text-base",
          className
        )}
        {...props}
      >
        {children}
      </label>
    );
  }
);

MobileFormLabel.displayName = "MobileFormLabel";

interface MobileFormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

const MobileFormDescription = React.forwardRef<HTMLParagraphElement, MobileFormDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "text-sm text-muted-foreground",
          "sm:text-base",
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

MobileFormDescription.displayName = "MobileFormDescription";

interface MobileFormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

const MobileFormMessage = React.forwardRef<HTMLParagraphElement, MobileFormMessageProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "text-sm font-medium text-destructive",
          "sm:text-base",
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

MobileFormMessage.displayName = "MobileFormMessage";

export {
  MobileForm,
  MobileFormField,
  MobileFormLabel,
  MobileFormDescription,
  MobileFormMessage,
}; 