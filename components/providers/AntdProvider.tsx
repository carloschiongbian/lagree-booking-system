"use client";

import { ConfigProvider } from "antd";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorTextHeading: "#36013F",
          colorTextSecondary: "#36013F",
          colorText: "#36013F",
          colorPrimary: "#2563eb",
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          Checkbox: {
            colorPrimary: "#36013F",
            colorPrimaryHover: "#36013F",
          },
          Steps: {
            colorPrimary: "#36013F", // active color
            colorTextDescription: "#666", // text color
            colorText: "#333",
          },
          Segmented: {
            itemSelectedBg: "#36013F",
            itemSelectedColor: "white",
          },
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: "#36013F",
            itemSelectedColor: "white",
            itemColor: "#36013F",
            itemHoverColor: "white",
            itemHoverBg: "#36013F",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
