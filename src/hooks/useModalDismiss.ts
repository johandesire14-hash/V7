import React, { useEffect, useCallback } from "react";

interface UseModalDismissOptions {
  isOpen?: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  disabled?: boolean;
}

/**
 * Hook global pour la gestion centralisée de fermeture des modales,
 * tiroirs, popups et overlays par clic extérieur (overlay) ou touche Échap.
 */
export function useModalDismiss({
  isOpen = true,
  onClose,
  closeOnEscape = true,
  lockScroll = true,
  disabled = false,
}: UseModalDismissOptions) {
  // Gestion de la touche Échap
  useEffect(() => {
    if (!isOpen || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, disabled, onClose]);

  // Verrouillage du scroll du body
  useEffect(() => {
    if (!isOpen || !lockScroll || disabled) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, lockScroll, disabled]);

  // Handler de clic sur le backdrop/overlay
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      // Ne ferme que si le clic s'est produit exactement sur l'overlay (l'arrière-plan),
      // ou si l'élément cliqué possède l'attribut data-modal-backdrop="true"
      const target = e.target as HTMLElement;
      if (
        e.target === e.currentTarget ||
        target.getAttribute("data-modal-backdrop") === "true"
      ) {
        onClose();
      }
    },
    [disabled, onClose]
  );

  // Handler à placer sur le conteneur intérieur pour stopper la propagation
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return {
    overlayProps: {
      onClick: handleOverlayClick,
      "data-modal-backdrop": "true",
      role: "dialog",
      "aria-modal": true,
    },
    contentProps: {
      onClick: handleContentClick,
    },
    handleOverlayClick,
    handleContentClick,
  };
}
