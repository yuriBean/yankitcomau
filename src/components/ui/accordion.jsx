import React from "react";
    import * as AccordionPrimitive from "@radix-ui/react-accordion";
    import { ChevronDown } from "lucide-react";
    import { cn } from "@/lib/utils";

    const Accordion = AccordionPrimitive.Root;

    const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
      <AccordionPrimitive.Item
        ref={ref}
        className={cn("border-b border-slate-200 dark:border-slate-700", className)}
        {...props} />
    ));
    AccordionItem.displayName = "AccordionItem";

    const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          className={cn(
            "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 text-left text-base md:text-lg text-foreground dark:text-slate-100",
            className
          )}
          {...props}>
          {children}
          <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-primary" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    ));
    AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

    const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
      <AccordionPrimitive.Content
        ref={ref}
        className="overflow-hidden text-sm md:text-base transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        {...props}>
        <div className={cn("pb-4 pt-0 text-muted-foreground dark:text-slate-300 leading-relaxed", className)}>{children}</div>
      </AccordionPrimitive.Content>
    ));
    AccordionContent.displayName = AccordionPrimitive.Content.displayName;

    export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };