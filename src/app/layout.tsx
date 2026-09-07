import type { Metadata } from "next";
import { Archivo, Archivo_Narrow } from "next/font/google";
import "./globals.css";

// Archivo: grotesca de alto rendimiento, pensada para impresión y señalética.
// Narrow queda para los rótulos de datos.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Directorio de Profesionales — Grupo San Amaro",
    template: "%s — Directorio de Profesionales",
  },
  description:
    "Directorio de profesionales y egresados del Grupo Educacional San Amaro: ficha de contacto pública para que cada uno se dé a conocer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CL" className={`${archivo.variable} ${archivoNarrow.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
