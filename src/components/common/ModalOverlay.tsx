import React from "react";
import { useModalDismiss } from "../../hooks/useModalDismiss";

export interface ModalOverlayProps {
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
  contentClassName?: string;
  zIndex?: string;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  disabled?: boolean;
  id?: string;
}

/**
 * Composant centralisé d'overlay et de modal.
 * Garantit la règle globale du site :
 * - Clic à l'extérieur (sur l'arrière-plan/overlay) -> Ferme la modale immédiatement
 * - Clic à l'intérieur de la fenêtre de contenu -> Ne ferme pas la modale
 * - Touche Échap -> Ferme la modale
 */
export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  isOpen = true,
  onClose,
  children,
  className = "",
  backdropClassName = "bg-black/80 backdrop-blur-md",
  contentClassName = "",
  zIndex = "z-50",
  closeOnEscape = true,
  lockScroll = true,
  disabled = false,
  id,
}) => {
  const { overlayProps, contentProps } = useModalDismiss({
    isOpen,
    onClose,
    closeOnEscape,
    lockScroll,
    disabled,
  });

  if (!isOpen) return null;

  return (
    <div
      id={id}
      {...overlayProps}
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-3 sm:p-5 overflow-y-auto ${backdropClassName} ${className} animate-in fade-in duration-150 cursor-pointer`}
    >
      <div
        {...contentProps}
        className={`relative w-full cursor-default ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
};
