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
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser, logout as logoutAction } from "@/lib/features/authSlice";

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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile) {
        dispatch(setUser(profile));
      }
    };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logoutAction());
    router.push("/login");
  };

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "Dashboard",
      onClick: () => router.push("/"),
    },
    {
      key: "2",
      icon: <CalendarOutlined />,
      label: "Bookings",
      onClick: () => router.push("/bookings"),
    },
    {
      key: "3",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/"),
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
        <div className="h-16 flex items-center justify-center border-b border-slate-200">
          <Text className="text-xl font-semibold text-slate-800">
            Lagree Studio
          </Text>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={menuItems}
          className="border-r-0 pt-4"
        />
      </Sider>

      <Layout>
        <Header className="!bg-white border-b border-slate-200 !px-4 md:!px-6 flex items-center justify-between !h-16">
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden mr-2"
            />
            <Text className="text-xl font-semibold text-slate-800 lg:hidden">
              BookingApp
            </Text>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors">
              <div className="text-right hidden md:block">
                <Text className="block text-sm font-medium">
                  {user?.full_name || "User"}
                </Text>
                <Text className="block text-xs text-slate-500">
                  {user?.email}
                </Text>
              </div>
              <Avatar
                size="large"
                icon={<UserOutlined />}
                className="bg-blue-600"
              >
                {user?.full_name?.[0]?.toUpperCase() || "U"}
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
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="lg:hidden"
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={menuItems}
          className="border-r-0"
          onClick={() => setMobileMenuOpen(false)}
        />
      </Drawer>
    </Layout>
  );
}
