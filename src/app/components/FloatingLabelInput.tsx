import { useId, useState } from "react";
import { motion } from "motion/react";

/**
 * FloatingLabelInput — minimalist monochrome floating-label field.
 *
 *  - Idle: white box, thin black border, label centered-left inside.
 *  - Focused / filled: the label glides up onto the top border, shrinks,
 *    turns white on a black pill that masks the border behind it. The native
 *    caret blinks in the now-empty field.
 *
 * Smooth ease-in-out, 300ms.
 */
export function FloatingLabelInput({
  label = "Username",
  type = "text",
  value,
  onChange,
}: {
  label?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState("");
  const val = value ?? internal;
  const active = focused || val.length > 0;

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={val}
        onChange={(e) => (onChange ? onChange(e.target.value) : setInternal(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="h-14 w-full rounded-xl border border-black bg-white px-4 text-base text-black caret-black outline-none"
      />
      <motion.label
        htmlFor={id}
        className="pointer-events-none absolute left-3 origin-left rounded-md whitespace-nowrap"
        initial={false}
        animate={
          active
            ? {
                top: 0,
                y: "-50%",
                fontSize: 12,
                paddingLeft: 8,
                paddingRight: 8,
                paddingTop: 2,
                paddingBottom: 2,
                color: "#ffffff",
                backgroundColor: "#000000",
              }
            : {
                top: "50%",
                y: "-50%",
                fontSize: 16,
                paddingLeft: 4,
                paddingRight: 4,
                paddingTop: 0,
                paddingBottom: 0,
                color: "rgba(0,0,0,0.3)",
                backgroundColor: "rgba(0,0,0,0)",
              }
        }
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {label}
      </motion.label>
    </div>
  );
}

export default FloatingLabelInput;
