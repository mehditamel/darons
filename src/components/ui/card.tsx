import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-2xl text-card-foreground", {
  variants: {
    variant: {
      default: "border bg-card shadow-elevation-1",
      interactive:
        "border bg-card shadow-elevation-1 transition-all duration-base hover:shadow-elevation-2 hover:-translate-y-0.5",
      gradient:
        "border-0 shadow-elevation-1 transition-all duration-base hover:shadow-elevation-2 hover:-translate-y-0.5",
    },
    tone: {
      none: "",
      orange: "",
      teal: "",
      blue: "",
      purple: "",
      gold: "",
      green: "",
      red: "",
    },
  },
  compoundVariants: [
    { variant: "gradient", tone: "orange", class: "bg-gradient-to-br from-warm-orange/5 to-warm-orange/15 hover:shadow-warm-orange" },
    { variant: "gradient", tone: "teal", class: "bg-gradient-to-br from-warm-teal/5 to-warm-teal/15 hover:shadow-warm-teal" },
    { variant: "gradient", tone: "blue", class: "bg-gradient-to-br from-warm-blue/5 to-warm-blue/15 hover:shadow-warm-blue" },
    { variant: "gradient", tone: "purple", class: "bg-gradient-to-br from-warm-purple/5 to-warm-purple/15 hover:shadow-warm-purple" },
    { variant: "gradient", tone: "gold", class: "bg-gradient-to-br from-warm-gold/5 to-warm-gold/15 hover:shadow-warm-gold" },
    { variant: "gradient", tone: "green", class: "bg-gradient-to-br from-warm-green/5 to-warm-green/15 hover:shadow-warm-green" },
    { variant: "gradient", tone: "red", class: "bg-gradient-to-br from-warm-red/5 to-warm-red/15 hover:shadow-warm-red" },
  ],
  defaultVariants: {
    variant: "default",
    tone: "none",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, tone, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, tone }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  // Content is always provided by consumers via children/props.
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
