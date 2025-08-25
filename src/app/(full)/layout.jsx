"use client";

import Header from "@/components/header";
import Dock from "@/components/dock";

export default function BothLayout({ children }) {
  return (
    <>
      <main>{children}</main>
      <Dock />
    </>
  );
}
