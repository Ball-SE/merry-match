import "@/styles/globals.css";
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/datepicker-custom.css';
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // ปิด developer tools assistant
    if (typeof window !== 'undefined') {
      localStorage.setItem('developerTools.assistant.enabled', 'false');
    }
  }, []);
  return(
    <>
      <Head>
        <title>Merry Match</title>
        <meta name="description" content="Default description for Merry Match" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
