import React from "react";
import "./ProductCardSkeleton.css";

const ProductCardSkeleton = () => (
  <div className="product-card-skeleton" aria-hidden="true">
    <div className="product-card-skeleton__image skeleton-block" />
    <div className="product-card-skeleton__info">
      <div className="product-card-skeleton__title skeleton-block" />
      <div className="product-card-skeleton__desc skeleton-block" />
      <div className="product-card-skeleton__desc skeleton-block" />
      <div className="product-card-skeleton__rating skeleton-block" />
      <div className="product-card-skeleton__footer">
        <div className="product-card-skeleton__footer-left skeleton-block" />
        <div className="product-card-skeleton__footer-right skeleton-block" />
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
