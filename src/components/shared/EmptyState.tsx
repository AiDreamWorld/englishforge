import { SparkyCharacter } from '@/components/sparky/SparkyCharacter'

interface EmptyStateProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <SparkyCharacter mood="thinking" size={120} />
      <h3 className="mt-6 text-xl font-display font-bold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary text-center max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
