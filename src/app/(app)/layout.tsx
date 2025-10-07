import { ReactNode } from "react";
import { Layout } from "antd";
import AppHeader from "@/components/AppHeader";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const { Header, Content, Footer } = Layout;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <AppHeader />
      </Header>
      <Content style={{ padding: 16 }}>
        <div className="container mx-auto max-w-6xl p-2 sm:p-4">{children}</div>
      </Content>
      <Footer style={{ textAlign: "center" }}>© {new Date().getFullYear()} Lagree</Footer>
    </Layout>
  );
}
