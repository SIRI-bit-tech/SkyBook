// Module declarations for packages without type definitions

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export type LucideIcon = FC<SVGProps<SVGSVGElement>>;
  
  export const Plane: LucideIcon;
  export const Clock: LucideIcon;
  export const Calendar: LucideIcon;
  export const Users: LucideIcon;
  export const GitCompare: LucideIcon;
  export const X: LucideIcon;
  export const Check: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const User: LucideIcon;
  export const LogOut: LucideIcon;
  export const Settings: LucideIcon;
  
  // Add more icons as needed
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Menu: LucideIcon;
  export const Search: LucideIcon;
  export const Bell: LucideIcon;
  export const Home: LucideIcon;
  export const Mail: LucideIcon;
  export const Phone: LucideIcon;
  export const MapPin: LucideIcon;
  export const Star: LucideIcon;
  export const Heart: LucideIcon;
  export const Share: LucideIcon;
  export const Download: LucideIcon;
  export const Upload: LucideIcon;
  export const Edit: LucideIcon;
  export const Trash: LucideIcon;
  export const Plus: LucideIcon;
  export const Minus: LucideIcon;
  export const Filter: LucideIcon;
  export const SortAsc: LucideIcon;
  export const SortDesc: LucideIcon;
}

declare module 'next/image' {
  import { ComponentType, ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImageData;
    alt: string;
    width?: number | `${number}`;
    height?: number | `${number}`;
    fill?: boolean;
    loader?: ImageLoader;
    quality?: number | `${number}`;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: string;
    objectFit?: string;
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
  
  export interface StaticImageData {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  }
  
  export type ImageLoader = (resolverProps: {
    src: string;
    width: number;
    quality?: number;
  }) => string;
  
  const Image: ComponentType<ImageProps>;
  export default Image;
}
