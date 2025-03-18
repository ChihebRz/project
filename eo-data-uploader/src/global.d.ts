import "react";

declare module "react" {
  interface InputHTMLAttributes<T> extends React.HTMLAttributes<T> {
    webkitDirectory?: boolean | string; // Ajoute webkitDirectory comme attribut valide
  }
}