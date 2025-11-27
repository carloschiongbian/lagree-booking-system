"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import StudioGuidelines from "@/components/layout/StudioGuidelines";

const StudioGuidelinesPage = () => {
  return (
    <AuthenticatedLayout>
      <StudioGuidelines />
    </AuthenticatedLayout>
  );
};

export default StudioGuidelinesPage;
