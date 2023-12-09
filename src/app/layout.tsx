import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import { Grid } from "@mui/material";
import Providers from "@/components/Providers";
import AuthContext from "@/components/AuthContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DOLDOLMEET",
  description: "돌아가며 만나는 나의 아이돌, 돌돌밋",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className} style={{ backgroundColor: "#F8F8F8" }}>
        <AuthContext>
          <Providers>
            <Header />
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              maxWidth="xl"
              sx={{
                mx: "auto",
                width: "100%",
                paddingTop: 10,
                minHeight: "98vh",
              }}
            >
              {children}
            </Grid>
          </Providers>
        </AuthContext>
        <Script
          src={
            "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"
          }
        />
        <Script
          src={
            "https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"
          }
        />
      </body>
    </html>
  );
}
