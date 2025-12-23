import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = option.values?.map((v) => v.value)

  const isColor = (title ?? "").toLowerCase().includes("color")
  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#22C55E",
    yellow: "#F59E0B",
    orange: "#FB923C",
    purple: "#A855F7",
    pink: "#EC4899",
    gray: "#9CA3AF",
    grey: "#9CA3AF",
    brown: "#92400E",
    navy: "#1E3A8A",
    beige: "#F5F5DC",
    gold: "#D4AF37",
    silver: "#C0C0C0",
  }
  const normalizeColor = (val?: string) => {
    const v = (val || "").toLowerCase().trim()
    if (v.startsWith("#") || v.startsWith("rgb")) return v
    return colorMap[v] || undefined
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className={clx("flex flex-wrap items-center gap-2", {
          "gap-3": isColor,
        })}
        data-testid={dataTestId}
      >
        {filteredOptions?.map((v) => {
          const colorValue = isColor ? normalizeColor(v || "") : undefined
          if (isColor && colorValue) {
            const selected = v === current
            return (
              <button
                onClick={() => updateOption(option.title ?? "", v ?? "")}
                key={v}
                className={clx(
                  "relative w-9 h-9 rounded-full border-2 transition-all",
                  selected ? "border-grey-90" : "border-grey-30 hover:border-grey-50"
                )}
                style={{ backgroundColor: colorValue }}
                disabled={disabled}
                aria-label={v}
                data-testid="option-button"
              >
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={"#111827"}
                      className="w-4 h-4"
                    >
                      <path d="M20.285 6.709a1 1 0 010 1.414l-9.334 9.334a1 1 0 01-1.414 0L3.715 11.619a1 1 0 111.414-1.414l5.084 5.084 8.627-8.627a1 1 0 011.445.047z" />
                    </svg>
                  </span>
                )}
              </button>
            )
          }

          return (
            <button
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              className={clx(
                "border border-grey-40 bg-white text-grey-90 text-sm h-10 rounded-md px-3 py-2 min-w-[64px]",
                {
                  "border-grey-90 ring-1 ring-grey-90": v === current,
                  "hover:shadow-sm transition-shadow ease-in-out duration-150":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
