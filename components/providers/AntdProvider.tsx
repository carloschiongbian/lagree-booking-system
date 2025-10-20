"use client";

import { ConfigProvider } from "antd";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2563eb",
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          Segmented: {
            itemSelectedBg: "purple",
            itemSelectedColor: "white",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
