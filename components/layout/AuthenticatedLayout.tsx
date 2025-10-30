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
} from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser, logout as logoutAction } from "@/lib/features/authSlice";
import { LuPackage } from "react-icons/lu";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

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

    console.log("trigger");
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profile) {
      if (profile.is_user === false) {
        router.push("/admin/dashboard");
        return;
      }
      dispatch(setUser(profile));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logoutAction());
    router.push("/login");
  };

  const getSelectedKey = () => {
    if (pathname === "/dashboard") return "1";
    if (pathname === "/profile") return "2";
    if (pathname === "/credits") return "3";
    if (pathname === "/packages") return "4";
    if (pathname === "/bookings") return "5";
    return "1";
  };

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "2",
      icon: <UserOutlined />,
      label: <Link href="/profile">Profile</Link>,
    },
    {
      key: "3",
      icon: <CreditCardOutlined />,
      label: <Link href="/credits">Session Credits</Link>,
    },
    {
      key: "4",
      icon: <LuPackage />,
      label: <Link href="/packages">Session Packages</Link>,
    },
    {
      key: "5",
      icon: <CalendarOutlined />,
      label: <Link href="/bookings">Lagree Schedules</Link>,
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
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        className="!bg-white border-r border-slate-200 hidden lg:block"
        width={240}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-200 bg-[#36013F]">
          <Text className="text-xl font-semibold text-slate-200">
            Lagree Studio
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
                icon={<UserOutlined />}
                className="bg-slate-200"
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
    </Layout>
  );
}
