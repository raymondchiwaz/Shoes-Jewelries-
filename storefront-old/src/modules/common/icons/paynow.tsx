import React from "react"

import { IconProps } from "types/icon"

const Paynow: React.FC<IconProps> = ({
  size = "24",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      {/* Paynow Zimbabwe-inspired icon - green with P */}
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#25D366" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        P
      </text>
    </svg>
  )
}

export default Paynow
