interface IconProps {
  className?: string
  size?: number
  strokeWidth?: number
}

const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
})

export function InboxIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M4 13.5 5.4 6.3A2 2 0 0 1 7.36 4.7h9.28a2 2 0 0 1 1.96 1.6L20 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M4 13.5h4l1.2 2.2h5.6L16 13.5h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StarIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M12 3.6c.27 0 .52.15.64.4l2.2 4.46 4.92.72c.6.09.84.83.4 1.25l-3.56 3.47.84 4.9c.1.6-.52 1.05-1.05.77L12 17.94l-4.4 2.31c-.53.28-1.15-.17-1.05-.77l.84-4.9-3.56-3.47c-.44-.42-.2-1.16.4-1.25l4.92-.72 2.2-4.46c.12-.25.37-.4.65-.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CalendarIcon({ className, size, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.4" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

export function LayersIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M3 12.5 12 17l9-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M3 16.8 12 21.3l9-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" opacity="0.6" />
    </svg>
  )
}

export function BoxIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 7.5 12 11l8-3.5M12 11v9" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

export function LogbookIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M5 4.5h11a3 3 0 0 1 3 3V19a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 18.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M5 16.5h12.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 9.7l2 2 3.4-3.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TrashIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 7h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M7 7h10l-.8 11.1A2 2 0 0 1 14.2 20H9.8a2 2 0 0 1-2-1.9L7 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.5 10.5v6M13.5 10.5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function MoonIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M20 14.2A8 8 0 0 1 9.6 4 8 8 0 1 0 20 14.2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function FlagIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6 21V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6 4.5h9.5a.6.6 0 0 1 .47.97L13.8 8.2a.6.6 0 0 0 0 .76l2.17 2.73a.6.6 0 0 1-.47.97H6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TagIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M4 11.5V5.5A1.5 1.5 0 0 1 5.5 4h6l8 8a1.5 1.5 0 0 1 0 2.1l-5.4 5.4a1.5 1.5 0 0 1-2.1 0l-8-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

export function ChecklistIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 6.5l1.6 1.6L8.5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16.5l1.6 1.6L8.5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 7h9M11.5 17h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function NotesIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 6.5h14M5 11h14M5 15.5h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function PlusIcon({ className, size, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

export function SearchIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function GearIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 2.8l1.1 2.2 2.4-.5.5 2.4 2.2 1.1-1.1 2.2 1.1 2.2-2.2 1.1-.5 2.4-2.4-.5L12 21.2l-1.1-2.2-2.4.5-.5-2.4-2.2-1.1 1.1-2.2-1.1-2.2 2.2-1.1.5-2.4 2.4.5L12 2.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RepeatIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 9a6 6 0 0 1 10.5-4M19 8V4m0 4h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 15a6 6 0 0 1-10.5 4M5 16v4m0-4h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ProjectIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function AreaIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="4" y="4" width="7" height="7" rx="1.4" fill="currentColor" />
      <rect x="13" y="4" width="7" height="7" rx="1.4" fill="currentColor" opacity="0.55" />
      <rect x="4" y="13" width="7" height="7" rx="1.4" fill="currentColor" opacity="0.55" />
      <rect x="13" y="13" width="7" height="7" rx="1.4" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function CheckIcon({ className, size, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 12.5l4 4 10-10.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MoveIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 7.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6.2L9.8 4.8A2 2 0 0 0 8.3 4H6a2 2 0 0 0-2 2v1.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

export function CloseIcon({ className, size, strokeWidth = 1.9 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

export function SunIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
