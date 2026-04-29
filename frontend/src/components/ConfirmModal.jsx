import { useEffect } from "react";

/**
 * A reusable confirmation modal.
 * Props:
 *   isOpen    - bool
 *   title     - string
 *   message   - string
 *   onConfirm - fn (called when user clicks Confirm)
 *   onCancel  - fn (called when user clicks Cancel or clicks backdrop)
 *   confirmText  - string (default: "Confirm")
 *   cancelText   - string (default: "Cancel")
 *   danger       - bool   (if true, confirm button is red)
 */
const ConfirmModal = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-box confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="confirm-icon">{danger ? "⚠️" : "❓"}</div>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={danger ? "btn-confirm-danger" : "btn-confirm"}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
