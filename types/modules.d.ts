// Module declarations for packages without type definitions

declare module 'next/server' {
  export { NextRequest, NextResponse } from 'next/dist/server/web/spec-extension/request';
  export { NextFetchEvent } from 'next/dist/server/web/spec-extension/fetch-event';
  export { NextMiddleware } from 'next/dist/server/web/types';
  export { ImageResponse } from 'next/dist/server/web/spec-extension/image-response';
  export { userAgent } from 'next/dist/server/web/spec-extension/user-agent';
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
  export function useParams(): any;
  export function redirect(url: string): never;
  export function permanentRedirect(url: string): never;
  export function notFound(): never;
}
