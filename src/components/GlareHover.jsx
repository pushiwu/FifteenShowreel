import "./GlareHover.css";

const toGlareColor = (color, opacity) => {
  const hex = color.replace("#", "");
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }

  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const red = parseInt(hex[0] + hex[0], 16);
    const green = parseInt(hex[1] + hex[1], 16);
    const blue = parseInt(hex[2] + hex[2], 16);
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }

  return color;
};

export default function GlareHover({
  as: Component = "div",
  width = "500px",
  height = "500px",
  background = "#000",
  borderRadius = "10px",
  borderColor = "#333",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = "",
  style = {},
  ...rest
}) {
  const variables = {
    "--gh-width": width,
    "--gh-height": height,
    "--gh-bg": background,
    "--gh-br": borderRadius,
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": toGlareColor(glareColor, glareOpacity),
    "--gh-border": borderColor,
  };

  return (
    <Component
      className={`glare-hover ${playOnce ? "glare-hover--play-once" : ""} ${className}`.trim()}
      style={{ ...variables, ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
}
