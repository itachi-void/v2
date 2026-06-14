import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import "./i18n";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
