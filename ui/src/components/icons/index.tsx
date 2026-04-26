import { type SVGProps } from "react"

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function createIcon(
  path: (props: IconProps) => React.ReactNode,
  viewBox: string = "0 0 16 16"
) {
  return function Icon({ size = 16, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        {...props}
      >
        {path({ size, ...props })}
      </svg>
    )
  }
}

export const ChevronRight = createIcon(() => (
  <path
    d="M6 4l4 4-4 4"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
))

export const ChevronLeft = createIcon(() => (
  <path
    d="M10 4l-4 4 4 4"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
))

export const ChevronDown = createIcon(() => (
  <path
    d="M4 6l4 4 4-4"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
))

export const Plus = createIcon(() => (
  <path
    d="M8 3v10M3 8h10"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  />
))

export const Close = createIcon(() => (
  <path
    d="M4 4l8 8M12 4l-8 8"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  />
))

export const Check = createIcon(() => (
  <path
    d="M3 8l3.5 3.5L13 5"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
))

export const Search = createIcon(() => (
  <>
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </>
))

export const Bell = createIcon(
  () => (
    <path
      d="M4 15V9a6 6 0 0112 0v6M3 15h14M8 17a2 2 0 004 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "0 0 20 20"
)

export const Home = createIcon(
  () => (
    <path
      d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  ),
  "0 0 24 24"
)

export const List = createIcon(
  () => (
    <path
      d="M4 6h16M4 12h16M4 18h16"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  ),
  "0 0 24 24"
)

export const User = createIcon(
  () => (
    <>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4 21c1-4 4.5-6 8-6s7 2 8 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </>
  ),
  "0 0 24 24"
)

export const Inbox = createIcon(
  () => (
    <path
      d="M3 13l3-8h12l3 8v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6zM3 13h5a2 2 0 014 0h4a2 2 0 014 0h5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  ),
  "0 0 24 24"
)

export const Coin = createIcon(
  () => (
    <>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 6v8M7.5 8.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.3-2.5 1.5-2.5.5-2.5 1.5 1 1.5 2.5 1.5 2.5-.5 2.5-1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </>
  ),
  "0 0 20 20"
)

export const MapPin = createIcon(() => (
  <>
    <path
      d="M8 14s5-4.5 5-8.5a5 5 0 10-10 0c0 4 5 8.5 5 8.5z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="8" cy="5.5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
  </>
))

export const Clock = createIcon(() => (
  <>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5v3.5L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </>
))

export const Camera = createIcon(
  () => (
    <>
      <path
        d="M4 8h3l2-2h6l2 2h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  "0 0 24 24"
)

export const Shield = createIcon(() => (
  <>
    <path
      d="M8 1.5l5.5 2v4.2c0 3.3-2.3 6.2-5.5 7.3-3.2-1.1-5.5-4-5.5-7.3V3.5L8 1.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 8l2 2 3-3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
))

export const Arrow = createIcon(() => (
  <path
    d="M3 8h10M9 4l4 4-4 4"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
))

export const Filter = createIcon(() => (
  <path
    d="M2 4h12l-4.5 6v4l-3-1.5V10L2 4z"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  />
))

export const Star = createIcon(
  () => (
    <path
      d="M10 1l2.8 5.9 6.2.9-4.5 4.4 1.1 6.3L10 15.5l-5.6 3 1.1-6.3L1 7.8l6.2-.9L10 1z"
      fill="currentColor"
    />
  ),
  "0 0 20 20"
)

export const Send = createIcon(() => (
  <path
    d="M2 8l12-6-4.5 12-2-5L2 8z"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinejoin="round"
  />
))

export const Flame = createIcon(
  () => (
    <path
      d="M8 1s4 3.5 4 7.5A4 4 0 014 8.5c0-1.5 1-2.5 1-4 0 2 2 2 2 0 0-1-1-2.5 1-3.5z"
      fill="currentColor"
    />
  ),
  "0 0 16 16"
)

export const Edit = createIcon(() => (
  <path
    d="M11 2l3 3-8 8H3v-3l8-8z"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  />
))

export const Trash = createIcon(() => (
  <path
    d="M3 4h10M6 4V2h4v2M4.5 4l.5 9a1 1 0 001 1h4a1 1 0 001-1l.5-9"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
))

export const Menu = createIcon(
  () => (
    <>
      <circle cx="4" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
    </>
  ),
  "0 0 20 20"
)

export const Lock = createIcon(() => (
  <>
    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" />
  </>
))

export const Mail = createIcon(() => (
  <>
    <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </>
))

export const Phone = createIcon(() => (
  <path
    d="M3 3h3l1 3-2 1c.5 2 2 3.5 4 4l1-2 3 1v3c0 .5-.5 1-1 1C7 14 2 9 2 4c0-.5.5-1 1-1z"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  />
))

export const Briefcase = createIcon(
  () => (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
  "0 0 24 24"
)

export const Sparkle = createIcon(
  () => (
    <path
      d="M8 1l1.5 4L13.5 6.5 9.5 8 8 12 6.5 8 2.5 6.5 6.5 5 8 1zM13 11l.7 1.8L15.5 13l-1.8.7L13 15.5l-.7-1.8L10.5 13l1.8-.2L13 11z"
      fill="currentColor"
    />
  ),
  "0 0 16 16"
)

export const CreditCoin = createIcon(
  () => (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v10M9 9.5c0-1.2 1.2-1.8 3-1.8s3 .6 3 1.8-1.2 1.5-3 1.8-3 .6-3 1.8 1.2 1.8 3 1.8 3-.6 3-1.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  "0 0 24 24"
)

export const Wrench = createIcon(
  () => (
    <path
      d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "0 0 24 24"
)

export const Hammer = createIcon(
  () => (
    <>
      <path
        d="M6 15l8-8M15 6l3-3 3 3-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l-6 6 3 3 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  "0 0 24 24"
)

export const Comment = createIcon(
  () => (
    <path
      d="M21 12c0 4.418-4.03 8-9 8a9.862 9.862 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "0 0 24 24"
)

export const MessageSquare = createIcon(
  () => (
    <>
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  "0 0 24 24"
)

export const StarOutline = createIcon(
  () => (
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "0 0 24 24"
)

export const Icons = {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  Close,
  Check,
  Search,
  Bell,
  Home,
  List,
  User,
  Inbox,
  Coin,
  CreditCoin,
  MapPin,
  Clock,
  Camera,
  Shield,
  Arrow,
  Filter,
  Star,
  StarOutline,
  Send,
  Flame,
  Edit,
  Trash,
  Menu,
  Lock,
  Mail,
  Phone,
  Briefcase,
  Sparkle,
  Wrench,
  Hammer,
  Comment,
  MessageSquare,
}
