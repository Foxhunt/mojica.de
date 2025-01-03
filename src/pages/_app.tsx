import { Analytics } from "@vercel/analytics/next";
import { ChakraProvider } from "@chakra-ui/react";

import theme from "../theme";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ChakraProvider value={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
      <Analytics />
    </>
  );
}

export default MyApp;
