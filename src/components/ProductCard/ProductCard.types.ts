export interface ProductCardProps {
  /** Product thumbnail/preview image URL */
  imageUrl: string;
  /** Product title */
  title: string;
  /** Short description, clamped to 2 lines */
  description: string;
  /** Rating from 0 to 5 */
  rating: number;
  /** Number of downloads */
  downloads: number;
  /** Price in currency units; 0 means free ("Gratis") */
  price: number;
  /** Optional badge text shown over the image (e.g. "En tu zona") */
  badge?: string;
  /** Manufacturing technology name (e.g. "Impresión 3D") */
  tecnologia?: string;
  /** Compatible material names, shown as tags */
  materiales?: string[];
  /** Optional click handler; makes the card interactive */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
}
