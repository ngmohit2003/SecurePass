import toast from "react-hot-toast";

export const showSuccess = (msg) =>
  toast.success(msg, { className: "custom-toast" });

export const showError = (msg) =>
  toast.error(msg, { className: "custom-toast" });

