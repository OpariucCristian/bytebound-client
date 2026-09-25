import * as React from "react";
import {
  Root as AlertDialogRoot,
  Trigger as AlertDialogTrigger,
  Portal as AlertDialogPortal,
  Overlay as AlertDialogOverlay,
  Content as AlertDialogContent,
  Title as AlertDialogTitle,
  Description as AlertDialogDescription,
  Cancel as AlertDialogCancel,
  Action as AlertDialogAction,
} from "@radix-ui/react-alert-dialog";

import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { cn } from "@/shared/lib/utils";

interface ModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  /** Also lets Escape close the dialog. Leave it out for a required choice. */
  onOpenChange?: (open: boolean) => void;
  title: string;
  /** Short supporting text, read out with the title. */
  children?: React.ReactNode;
  /** Interactive content (pickers, forms) shown below the description. */
  body?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: "default" | "danger";
}

const Modal = ({
  trigger,
  open = false,
  onOpenChange,
  title,
  children,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ModalProps) => (
  <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
    {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
    <AlertDialogPortal>
      <AlertDialogOverlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none" />
      <AlertDialogContent
        // Without a description, don't point screen readers at a missing one
        {...(!children && { "aria-describedby": undefined })}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto -translate-x-1/2 -translate-y-1/2 p-4 sm:p-6",
          "bg-card text-card-foreground arcade-border",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "motion-reduce:animate-none",
        )}
      >
        <AlertDialogTitle className="mb-2 text-lg text-primary">
          {title}
        </AlertDialogTitle>
        {children && (
          <AlertDialogDescription className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {children}
          </AlertDialogDescription>
        )}
        {body}
        {(onCancel || onConfirm) && (
          <div className={cn("flex flex-wrap justify-end gap-3", body && "mt-6")}>
            {onCancel && (
              <AlertDialogCancel asChild>
                <ArcadeButton variant="primary" onClick={onCancel}>
                  {cancelLabel}
                </ArcadeButton>
              </AlertDialogCancel>
            )}
            {onConfirm && (
              <AlertDialogAction asChild>
                <ArcadeButton
                  variant={variant === "danger" ? "danger" : "secondary"}
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </ArcadeButton>
              </AlertDialogAction>
            )}
          </div>
        )}
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
);

export default Modal;
