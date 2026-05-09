import type React from "react";

// Navigation
export interface NavLink {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

// Toast
export type ToastType = "success" | "error" | "warning" | "info";
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Button
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline";
export type ButtonSize = "sm" | "md" | "lg";

// Card
export type CardVariant = "default" | "bordered" | "elevated" | "flat";

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
  | "select";

// MEC3D Domain types
export type ProductCategory =
  | "Autos"
  | "Motos"
  | "Barcos"
  | "Casa"
  | "Maquinas"
  | "Engranajes";
export type SaleModality = "design" | "fabrication" | "direct_sale" | "plans";
export type QualityTier = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  reputation: number;
}
