import type React from "react";

// Navigation
export interface NavLink {
  label: string;
  path: string;
  icon?: React.ReactNode;
  badgeCount?: number;
}

// Toast
export type ToastType = "success" | "error" | "warning" | "info";
export interface ToastAction {
  label: string;
  onClick: () => void;
}
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: ToastAction;
}

export type AddToast = (
  message: string,
  type: ToastType,
  duration?: number,
  action?: ToastAction,
) => void;

export type ToastPosition = "top" | "bottom";

// Button
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline";
export type ButtonSize = "sm" | "md" | "lg";

// Tag / badge
export type TagVariant =
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

// Card
export type CardVariant =
  | "default"
  | "bordered"
  | "elevated"
  | "flat"
  | "spec"
  | "option"
  | "contact";

// Form
export interface SelectOption {
  value: string;
  label: string;
}
export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "file";

// MEC3D Domain types
export type { ProductCategory } from "../utils/categoria.util";
export type SaleModality = "design" | "fabrication" | "direct_sale" | "plans";
export type QualityTier = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  reputation: number;
}
