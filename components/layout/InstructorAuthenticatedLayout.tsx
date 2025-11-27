"use client";

import { useEffect, useState } from "react";

import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Typography,
  Button,
  Drawer,
  Row,
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { CurrentPackageProps, supabase } from "@/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser, logout as logoutAction } from "@/lib/features/authSlice";
import dayjs from "dayjs";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function InstructorAuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      (() => {
        if (event === "SIGNED_OUT") {
          dispatch(logoutAction());
          router.push("/login");
        } else if (session) {
          checkUser();
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, router]);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select(
        `
          *,
          user_credits (
            id,
            credits,
            created_at
          ),
          client_packages (
            *,
            packages (*)
          ),
          instructors (*)
      `
      )
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error(error);
    }

    let signedUrl: string | undefined = undefined;

    //if user has an avatar
    if (profile.avatar_path) {
      const { data, error: urlError } = await supabase.storage
        .from("user-photos")
        .createSignedUrl(`${profile?.avatar_path}`, 3600);

      if (urlError) {
        console.error("Error generating signed URL:", urlError);
        signedUrl = undefined;
      }

      signedUrl = data?.signedUrl;
    }

    const latestCredit = profile?.user_credits?.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    const activePackage: CurrentPackageProps = profile?.client_packages?.find(
      (p: any) => p.status === "active"
    );

    if (profile) {
      if (profile.user_type === "admin") {
        router.push("/admin/dashboard");
        return;
      } else if (profile.user_type === "general") {
        router.push("/dashboard");
        return;
      }

      dispatch(
        setUser({
          ...profile,
          avatar_url: signedUrl,
          currentPackage: activePackage,
          credits: activePackage ? latestCredit.credits : 0,
        })
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logoutAction());
    router.push("/login");
  };

  const getSelectedKey = () => {
    if (pathname === "/instructor/assigned-schedules") return "1";

    return "1";
  };

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: (
        <Link href="/instructor/assigned-schedules">Assigned Classes</Link>
      ),
    },
  ];

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      {user?.deactivated === true && (
        <Row
          wrap={false}
          className="flex flex-col bg-slate-200 justify-center items-center w-[100vw] h-[100vh]"
        >
          <Title>Your instructor account has been disabled</Title>
          <Text>
            If you think this is a mistake, please contact{" "}
            <span className="font-bold">Supra8 Lagree Admin.</span>
          </Text>
          <Button
            onClick={handleLogout}
            className={`mt-[20px] bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03]`}
          >
            Logout
          </Button>
        </Row>
      )}
      {user?.deactivated !== true && (
        <>
          <Sider
            breakpoint="lg"
            collapsedWidth="0"
            className="!bg-white border-r border-slate-200 hidden lg:block"
            width={240}
          >
            <div className="h-16 flex items-center justify-center border-b border-slate-200 bg-[#36013F]">
              <Text className="text-xl font-semibold text-slate-200">
                Supra8 Lagree
              </Text>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[getSelectedKey()]}
              items={menuItems}
              className="border-r-0 pt-4"
            />
            <Text className="text-xl font-semibold text-slate-200 lg:hidden">
              LagreeStudio
            </Text>
          </Sider>

          <Layout>
            <Header className="!bg-[#36013F] border-b border-slate-200 !px-4 md:!px-6 flex items-center justify-between !h-16">
              <div className="flex items-center">
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden mr-2 text-slate-200"
                />
                <Text className="text-xl font-semibold text-slate-200">
                  {/* LagreeStudio */}
                </Text>
              </div>

              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-colors">
                  <div className="text-right hidden md:block">
                    <Text className="block text-sm font-medium !text-slate-200">
                      {user?.first_name || "User"}
                    </Text>
                    <Text className="block text-xs text-slate-500">
                      {user?.email}
                    </Text>
                  </div>
                  <Avatar
                    size="large"
                    src={user?.avatar_url}
                    icon={<UserOutlined />}
                    className="bg-slate-200 border-slate-500"
                  >
                    {user?.first_name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                </div>
              </Dropdown>
            </Header>

            <Content className="p-4 md:p-6 bg-slate-50">
              <div className="max-w-7xl mx-auto">{children}</div>
            </Content>
          </Layout>

          <Drawer
            title="Menu"
            placement="left"
            width={"70%"}
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            className="lg:hidden"
            styles={{ body: { paddingInline: 0 } }}
          >
            <Menu
              mode="inline"
              selectedKeys={[getSelectedKey()]}
              items={menuItems}
              className="border-r-0"
              onClick={() => setMobileMenuOpen(false)}
            />
          </Drawer>
        </>
      )}
    </Layout>
  );
}
