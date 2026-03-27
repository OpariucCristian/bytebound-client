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

import { cn } from "@/shared/lib/utils";

interface ModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  children?: React.ReactNode;
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
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ModalProps) => (
  <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
    {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
    <AlertDialogPortal>
      <AlertDialogOverlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <AlertDialogContent
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-6",
          "bg-card text-card-foreground arcade-border",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        )}
      >
        <AlertDialogTitle className="mb-2 text-lg text-primary">
          {title}
        </AlertDialogTitle>
        {children && (
          <AlertDialogDescription className="mb-6 text-sm text-muted-foreground">
            {children}
          </AlertDialogDescription>
        )}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <AlertDialogCancel
              onClick={onCancel}
              className={cn(
                "font-pixel border px-6 py-3 text-sm transition-all duration-150",
                "bg-muted text-muted-foreground hover:bg-muted/80 border-border",
                "shadow-[0_4px_0_0_hsl(var(--border))]",
                "active:translate-y-1 active:shadow-none active:brightness-75",
              )}
            >
              {cancelLabel}
            </AlertDialogCancel>
          )}
          {onConfirm && (
            <AlertDialogAction
              onClick={onConfirm}
              className={cn(
                "font-pixel border px-6 py-3 text-sm transition-all duration-150",
                variant === "danger"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-border"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/90 border-border",
                "shadow-[0_4px_0_0_hsl(var(--border))]",
                "active:translate-y-1 active:shadow-none active:brightness-75",
              )}
            >
              {confirmLabel}
            </AlertDialogAction>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
);

export default Modal;
