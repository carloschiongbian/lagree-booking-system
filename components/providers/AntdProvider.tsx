"use client";

import { ConfigProvider } from "antd";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorTextHeading: "black",
          colorTextSecondary: "black",
          colorText: "black",
          colorPrimary: "#2563eb",
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          Tabs: {
            itemActiveColor: "#800020",
            itemSelectedColor: "#800020",
            itemHoverColor: "#800020",
            inkBarColor: "#800020",
          },
          Checkbox: {
            colorPrimary: "#800020",
            colorPrimaryHover: "#800020",
          },
          Steps: {
            colorPrimary: "#800020", // active color
            colorTextDescription: "#666", // text color
            colorText: "#333",
          },
          Segmented: {
            itemSelectedBg: "#800020",
            itemSelectedColor: "white",
          },
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: "#800020",
            itemSelectedColor: "white",
            itemColor: "#800020",
            itemHoverColor: "white",
            itemHoverBg: "#800020",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
