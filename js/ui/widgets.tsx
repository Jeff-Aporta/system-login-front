/* ui/widgets */
(function () {
  "use strict";
  const React = (window as any).React;
  const MUI = (window as any).MaterialUI;
  const w = window as any;

  function Icon(props: { icon: string; size?: number }) {
    return React.createElement("iconify-icon", { icon: props.icon, style: { fontSize: props.size || 20 } });
  }
  function ThemeSwitch(props: { mode: string; onToggle: () => void }) {
    return React.createElement(MUI.IconButton, { size: "small", onClick: props.onToggle, color: "inherit" },
      React.createElement(Icon, { icon: props.mode === "dark" ? "mdi:weather-sunny" : "mdi:weather-night" }));
  }
  function TargetSwitch() {
    const [local, setLocal] = React.useState(w.SLG.Config.isLocal());
    React.useEffect(() => {
      const f = () => setLocal(w.SLG.Config.isLocal());
      window.addEventListener(w.SLG.Config.EVENT, f);
      return () => window.removeEventListener(w.SLG.Config.EVENT, f);
    }, []);
    return React.createElement(MUI.Chip, {
      size: "small", variant: "outlined", color: local ? "warning" : "primary",
      label: w.SLG.Config.label(), onClick: () => w.SLG.Config.setLocal(!local), sx: { cursor: "pointer" },
    });
  }
  w.SLG = w.SLG || {};
  w.SLG.UI = { Icon, ThemeSwitch, TargetSwitch };
})();
