"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ForwardRefExoticComponent, RefAttributes } from "react";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = PopoverPrimitive.Content as ForwardRefExoticComponent<
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & RefAttributes<HTMLElement>
>;

const PopoverClose = PopoverPrimitive.Close;

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };