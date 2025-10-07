import "@/styles/globals.css";
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/datepicker-custom.css';
import type { AppProps } from "next/app";
import Head from "next/head";
import { AuthProvider } from '@/context/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return(
    <AuthProvider>
      <Head>
        <title>Merry Match</title>
        <meta name="description" content="Default description for Merry Match" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
