import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  variant?: "default" | "filled" | "outline"
  sizeVariant?: "default" | "sm" | "lg"
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = "default", sizeVariant = "default", ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variant === "default" && "bg-background",
          variant === "filled" && "bg-secondary",
          variant === "outline" && "border-2 bg-background",
          sizeVariant === "default" && "h-10 px-4 py-2",
          sizeVariant === "sm" && "h-9 rounded-md px-3",
          sizeVariant === "lg" && "h-11 rounded-md px-8",
          className
        )}
        {...props}
      />
    )
  }
)
Select.displayName = "Select"

export { Select }
