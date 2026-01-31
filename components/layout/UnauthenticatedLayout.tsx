import { Button, Drawer, Row, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuOutlined } from "@ant-design/icons";
import Image from "next/image";

interface LayoutProps {
  children: React.ReactNode;
}

const { Title, Text, Paragraph } = Typography;

export default function UnauthenticatedLayout({ children }: LayoutProps) {
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // md breakpoint = 768px
  };

  useEffect(() => {
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const menuItems = [
    { label: "Home", href: "/about", primary: false },
    { label: "Login", href: "/login", primary: false },
    // { label: "JOIN THE 8CLUB", href: "/signup", primary: true },
  ];
  return (
    <div className="h-[100vh]">
      <header className="sticky top-0 z-[100] bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-10 lg:py-5">
          {/* Logo */}
          {/* <Title
            onClick={() => router.push("/about")}
            level={3}
            className="!m-0 tracking-[0.1em] whitespace-nowrap font-normal text-base sm:text-lg sm:font-light lg:text-xl"
          >
            8CLUBLAGREE
          </Title> */}
          <Row className="justify-center">
            <Image
              onClick={() => router.push("/about")}
              src="/images/main-logo.png"
              alt="Logo"
              width={130}
              height={130}
            />
          </Row>

          {/* Conditional Rendering */}
          {isMobile ? (
            <>
              <Row wrap={false} className="gap-x-[5px]">
                <Button
                  type={"primary"}
                  className={`bg-[#800020] border-[#800020] text-white hover:!bg-[#800020] font-medium w-fit`}
                  onClick={() => {
                    router.push("/signup");
                    setDrawerVisible(false);
                  }}
                >
                  JOIN THE 8CLUB
                </Button>
                {/* Hamburger Icon */}
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerVisible(true)}
                />
              </Row>
              {/* Drawer */}

              <Drawer
                width={"100%"}
                title="Menu"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                bodyStyle={{ padding: 0 }}
              >
                <div className="flex flex-col p-4 gap-3">
                  {menuItems.map((item) => (
                    <Button
                      key={item.label}
                      type={item?.primary ? "primary" : "text"}
                      className={`${
                        item?.primary
                          ? "bg-[#800020] border-[#800020] text-white hover:!bg-[#800020] font-medium w-full"
                          : "px-2 py-3 text-left text-sm font-normal w-full"
                      }`}
                      onClick={() => {
                        router.push(item.href);
                        setDrawerVisible(false);
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </Drawer>
            </>
          ) : (
            // Desktop Menu
            <div className="flex items-center gap-2 sm:gap-4">
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  type={item?.primary ? "primary" : "text"}
                  className={`${
                    item?.primary
                      ? "bg-[#800020] border-[#800020] text-white hover:!bg-[#800020] font-medium px-3 sm:px-4"
                      : "px-2 sm:px-3 text-sm sm:text-base font-normal"
                  }`}
                  onClick={() => router.push(item.href)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div>{children}</div>

      {/* Footer */}
      <footer className="bg-[#800020] text-white px-10 py-[60px] mt-[100px]">
        <div className="max-w-[1200px] mx-auto text-center">
          <Title
            level={3}
            className="!text-white font-light mb-6 tracking-[0.1em]"
          >
            8CLUBLAGREE
          </Title>
          <Paragraph style={{ color: "white", fontWeight: 300 }}>
            Streetscape Mall Banilad, Maria Luisa Road
            <br />
            Cebu City, Cebu 6000
          </Paragraph>
          <Paragraph
            style={{ color: "white", fontSize: "0.875rem", marginTop: "32px" }}
          >
            © 2026 8ClubLagree. All rights reserved.
          </Paragraph>
        </div>
      </footer>
    </div>
  );
}
