import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export const ArrowRight = ({ size = 16, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 12h16m-6-6 6 6-6 6" /></svg>);
export const ArrowLeft = ({ size = 16, ...p }: P) => (<svg {...base(size)} {...p}><path d="M20 12H4m6 6-6-6 6-6" /></svg>);
export const ArrowUpRight = ({ size = 14, ...p }: P) => (<svg {...base(size)} {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>);
export const Phone = ({ size = 18, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>);
export const Pin = ({ size = 18, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const Clock = ({ size = 18, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const Calendar = ({ size = 18, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>);
export const Tooth = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 6c0-1.6 1.6-2.5 3.2-2.5 1 0 1.6.5 2.8.5s1.8-.5 2.8-.5C16.4 3.5 18 4.4 18 6c0 2.4-.8 4-1.3 6.4-.3 1.6-.8 3.6-1.8 3.6-1.2 0-1-3.6-2.9-3.6S10.3 16 9.1 16c-1 0-1.5-2-1.8-3.6C6.8 10 6 8.4 6 6z" /><path d="M8 20h8" /></svg>);
export const Implant = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><path d="M8 3h8l-1 5H9z" /><path d="M10 8v3h4V8M9.5 11h5l-.5 2h-4zM10 13l.5 2h3l.5-2M11 15l1 5 1-5" /></svg>);
export const Denture = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 12c0-4 4-7 9-7s9 3 9 7c0 3-2 6-4 6H7c-2 0-4-3-4-6z" /><path d="M7 12v2M10 11.5v2.5M14 11.5v2.5M17 12v2" /></svg>);
export const Screen = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4M7 10h3l1.5-3 2 6L15 10h2" /></svg>);
export const Shield = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>);
export const Truck = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>);
export const Palette = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.5-1-2 0-3s2.5 0 4-1 3-3 3-5c0-4-4-7-9-7z" /><circle cx="7.5" cy="11" r="1.2" /><circle cx="10.5" cy="7.5" r="1.2" /><circle cx="15" cy="7.5" r="1.2" /></svg>);
export const Video = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10.5 21 8v8l-5-2.5" /></svg>);
export const Box = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></svg>);
export const Guard = ({ size = 22, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 9c0-3 3.6-5 8-5s8 2 8 5-3 9-8 9-8-6-8-9z" /><path d="M8 9.5h8" /></svg>);
export const User = ({ size = 18, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" /></svg>);
export const Menu = ({ size = 20, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>);
export const Close = ({ size = 20, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const Check = ({ size = 12, ...p }: P) => (<svg {...base(size)} strokeWidth={2.4} {...p}><path d="M5 12.5l4.5 4.5L19 7" /></svg>);

export const Logo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <circle cx="18" cy="18" r="17" stroke="#0A1A3A" strokeWidth="2" />
    <path d="M11 13.5c0-2.3 2.2-3.5 4.4-3.5 1.4 0 2.2.7 3.3.7s1.9-.7 3.3-.7c2.2 0 4.4 1.2 4.4 3.5 0 3.3-1.1 5.5-1.8 8.8-.4 2.2-1.1 4.4-2.4 4.4-1.6 0-1.3-5-3.5-5s-2 5-3.5 5c-1.3 0-2-2.2-2.4-4.4-.7-3.3-1.8-5.5-1.8-8.8z" fill="#2E6BF6" />
  </svg>
);

export const SERVICE_ICONS = { collecte: Truck, teinte: Palette, visio: Video, depot: Box } as const;
