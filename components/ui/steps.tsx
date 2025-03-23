import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
}

export function Steps({ currentStep, className, ...props }: StepsProps) {
  const childrenArray = React.Children.toArray(props.children)
  const steps = childrenArray.filter((child) => {
    return React.isValidElement(child) && child.type === Step
  })

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="relative after:absolute after:inset-x-0 after:top-1/2 after:h-0.5 after:-translate-y-1/2 after:bg-muted">
        <ol className="relative z-10 flex justify-between">
          {steps.map((step, index) => {
            const isActive = index <= currentStep
            return (
              <li key={index} className="flex items-center justify-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    isActive ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background",
                  )}
                >
                  {isActive && index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
      <ol className="grid grid-cols-4 gap-2 text-sm">
        {steps.map((step, index) => {
          const isActive = index <= currentStep
          return React.cloneElement(step as React.ReactElement, {
            isActive,
            step: index + 1,
            key: index,
          })
        })}
      </ol>
    </div>
  )
}

interface StepProps extends React.HTMLAttributes<HTMLLIElement> {
  title: string
  description?: string
  isActive?: boolean
  step?: number
}

export function Step({ title, description, isActive, className, ...props }: StepProps) {
  return (
    <li
      className={cn("flex flex-col text-center", isActive ? "text-foreground" : "text-muted-foreground", className)}
      {...props}
    >
      <div className="font-medium">{title}</div>
      {description && <div className="text-xs">{description}</div>}
    </li>
  )
}

