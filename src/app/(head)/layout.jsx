"use client";

import Header from "@/components/header";

export default function HeadOnlyLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
