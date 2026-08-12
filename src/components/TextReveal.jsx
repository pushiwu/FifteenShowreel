import DecryptedText from "./DecryptedText";

export default function TextReveal({
  text,
  animateOn = "view",
  sequential = true,
  revealDirection = "start",
  speed = 22,
  maxIterations = 14,
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  ...props
}) {
  return (
    <DecryptedText
      text={text}
      animateOn={animateOn}
      sequential={sequential}
      revealDirection={revealDirection}
      speed={speed}
      maxIterations={maxIterations}
      useOriginalCharsOnly
      className={`text-reveal-char ${className}`.trim()}
      parentClassName={`text-reveal ${parentClassName}`.trim()}
      encryptedClassName={`text-reveal-char text-reveal-encrypted ${encryptedClassName}`.trim()}
      {...props}
    />
  );
}
