import { Button, Tooltip, useColorScheme } from "@mui/joy";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ToggleThemeButton() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  // necessary for server-side rendering
  // because mode is undefined on the server
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }

  return (
    <Tooltip title={mode === "light" ? "Dark Mode" : "Light Mode"} variant="soft">
      <Button
        variant="soft"
        color="neutral"
        onClick={() => {
          setMode(mode === "light" ? "dark" : "light");
        }}
      >
        {mode === "light" ? <FaMoon /> : <FaSun />}
      </Button>
    </Tooltip>
  );
}
