import React, { useEffect, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./PlanDeCoursMenu.module.css";

interface PdfChoice {
  label: string;
  file: string;
}

// Les 4 documents PDF présents dans web/static/pdf
const CHOICES: PdfChoice[] = [
  /* { label: "Plan de cours A26", file: "PC_2026A_420-SN1-RE_Departement-Informatique.pdf" },
  { label: "Annexe - Département informatique", file: "PC_2026A_ANNEXE_Département-Informatique.pdf" },
  { label: "Annexe - Kevin et Mathieu", file: "PC_2026A_ANNEXE_Kevin_Mathieu.pdf" },
  { label: "Annexe - Joris", file: "PC_2026A_ANNEXE_Joris.pdf" },*/
];

export default function PlanDeCoursMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Base URL des PDF (gère le sous-chemin /420-SN1/ du site)
  const pdfBase = useBaseUrl("/pdf/");

  // Fermer le menu lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openPdf = (file: string) => {
    // Encode le nom de fichier (accents, etc.) puis ouvre dans un nouvel onglet
    const url = pdfBase + encodeURIComponent(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className={styles.menuContainer} ref={containerRef}>
      <button
        type="button"
        className={`${styles.menuButton} ${open ? styles.active : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className={styles.icon}>📄</span>
        <span className={styles.label}>Plan de cours</span>
        <span className={styles.caret}>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          {CHOICES.map((choice) => (
            <button
              key={choice.file}
              type="button"
              className={styles.dropdownItem}
              role="menuitem"
              onClick={() => openPdf(choice.file)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
