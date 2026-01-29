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
import { CurrentPackageProps, supabase } from "@/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser, logout as logoutAction } from "@/lib/features/authSlice";
import { LuPackage } from "react-icons/lu";
import { FaBook, FaList, FaQuestion } from "react-icons/fa";
import {
  useManageCredits,
  useManageImage,
  usePackageManagement,
} from "@/lib/api";
import Image from "next/image";

import dayjs from "dayjs";
import axios from "axios";
import axiosApi from "@/lib/axiosConfig";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { updateClientPackage, loading } = usePackageManagement();
  const { updateUserCredits, loading: updatingCredits } = useManageCredits();
  const user = useAppSelector((state) => state.auth.user);
  const { fetchImage } = useManageImage();

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

    const response = await axiosApi.get(`/user/initialize-user`, {
      params: { userID: session.user.id },
    });

    if (!response) return;

    const profile = response.data.data.profile;
    const payments = response.data.data.payment;

    let signedUrl: string | undefined = "";

    //if user has an avatar
    const signedURL = await fetchImage({
      avatarPath: profile?.avatar_path,
    });

    signedUrl = signedURL;

    const latestCredit = profile?.user_credits?.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

    const activePackage: CurrentPackageProps = profile?.client_packages?.find(
      (p: any) => p.status === "active",
    );

    if (profile) {
      if (profile.user_type === "admin") {
        router.push("/admin/dashboard");
        return;
      } else if (profile.user_type === "instructor") {
        router.push("/instructor/assigned-schedules");
        return;
      }

      // CONTINUE INTEGRATING MANUAL PAYMENTS UI SCENARIOS

      dispatch(
        setUser({
          ...profile,
          pendingPurchases: payments,
          avatar_url: signedUrl,
          currentPackage: activePackage,
          credits: activePackage ? latestCredit.credits : 0,
        }),
      );
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
    if (pathname === "/user-terms-and-conditions") return "6";
    if (pathname === "/faq") return "7";
    if (pathname === "/studio-guidelines") return "8";
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
      label: <Link href="/credits">Your Credits</Link>,
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
    {
      key: "6",
      icon: <FaBook />,
      label: (
        <Link href="/user-terms-and-conditions">Terms and Conditions</Link>
      ),
    },
    {
      key: "7",
      icon: <FaQuestion />,
      label: <Link href="/faq">FAQ</Link>,
    },
    {
      key: "8",
      icon: <FaList />,
      label: <Link href="/studio-guidelines">Studio Guidelines</Link>,
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
        className="!bg-white border-r border-slate-200 hidden lg:flex flex-col justify-between h-screen"
        width={240}
      >
        {/* Top Section */}
        <div>
          <div className="h-16 flex px-[25px] items-center justify-start border-b border-slate-200 bg-[#800020]">
            <Image
              src="/images/main-logo-white.png"
              alt="Logo"
              width={130}
              height={130}
            />
            {/* <Text className="text-xl font-semibold text-slate-200">
              8 Club Lagree
            </Text> */}
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
        </div>

        {/* Bottom Section */}
        {/* <Row wrap={false} className="bg-green-300 p-4">
          <FaInstagram />
        </Row> */}
      </Sider>

      <Layout>
        <Header className="!bg-[#800020] border-b border-slate-200 !px-4 md:!px-6 flex items-center justify-between !h-16">
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden mr-2 text-slate-200"
            />
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-colors">
              <div className="text-right hidden md:block">
                <Text className="block text-sm font-medium !text-slate-200">
                  {user?.first_name || "User"}
                </Text>
                <Text className="block text-xs text-white">{user?.email}</Text>
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

        <Content className="p-4 md:p-6 bg-slate-50 scroll-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </Content>
      </Layout>

      <Drawer
        title={
          <div className="flex px-[15px] items-center justify-start">
            <Image
              src="/images/main-logo-black.png"
              alt="Logo"
              width={100}
              height={100}
            />
          </div>
        }
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
