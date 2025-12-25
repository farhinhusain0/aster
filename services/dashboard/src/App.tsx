import React from "react";
import "./App.css";
import { router } from "./routes/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import { Box } from "@mui/joy";
import { AuthProvider } from "./providers/auth";
import { asterTheme } from "./theme";
import Toaster from "@/components/common/Toaster";
import { RouterProvider } from "react-router-dom";

const queryClient = new QueryClient();

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
);

function App() {
  const [showDevtools, setShowDevtools] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.toggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {showDevtools && (
          <React.Suspense fallback={null}>
            <ReactQueryDevtoolsProduction />
          </React.Suspense>
        )}
        <CssVarsProvider theme={asterTheme}>
          <CssBaseline />
          <Box sx={{ display: "flex", height: "100%" }}>
            <Toaster />
            <RouterProvider router={router} />
          </Box>
        </CssVarsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
