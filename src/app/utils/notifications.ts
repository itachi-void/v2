import { toast } from "sonner";

export const notify = {
  info: (title: string, message?: string) => toast(title, { description: message }),
  success: (title: string, message?: string) => toast.success(title, { description: message }),
  error: (title: string, message?: string) => toast.error(title, { description: message }),
  warn: (title: string, message?: string) => toast.warning(title, { description: message }),
};
