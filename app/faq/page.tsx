"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import FAQ from "@/components/layout/FAQ";

const FAQPage = () => {
  return (
    <AuthenticatedLayout>
      <FAQ />
    </AuthenticatedLayout>
  );
};

export default FAQPage;
