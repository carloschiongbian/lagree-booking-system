"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import UserTermsAndConditions from "@/components/layout/UserTermsAndConditions";

const TermsAndConditionsManager = () => {
  return (
    <AuthenticatedLayout>
      <UserTermsAndConditions />
    </AuthenticatedLayout>
  );
};

export default TermsAndConditionsManager;
