interface Props {
  icon: React.ReactNode
  title: string
  subtitle?: string
}

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 select-none">
      <div className="text-tertiary opacity-50 mb-4 [&>svg]:w-12 [&>svg]:h-12">
        {icon}
      </div>
      <div className="text-[15px] font-medium text-secondary">{title}</div>
      {subtitle && (
        <div className="text-[13px] text-tertiary mt-1 max-w-xs">{subtitle}</div>
      )}
    </div>
  )
}
