"use client";

import React from "react";
import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#1d9bf0",
          colorBgBase: "#ffffff",
          colorTextBase: "#1f2937",
          borderRadius: 8,
        },
        components: {
          Button: {
            controlHeight: 40,
          },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
