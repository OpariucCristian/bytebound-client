/** The right-pointing selection arrow from JRPG menus, drawn on a pixel grid. */
export const PixelCursor = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 6 8"
    className={className}
    fill="currentColor"
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    <path d="M0 0h2v1h1v1h1v1h1v2h-1v1h-1v1h-1v1h-2z" />
  </svg>
);
