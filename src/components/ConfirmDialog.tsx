import { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmDialogVariant
  children?: ReactNode
}

const variantConfig = {
  danger: {
    icon: XCircle,
    iconColor: 'text-red-600',
    buttonClass: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    buttonClass: 'bg-blue-600 hover:bg-blue-700',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    buttonClass: 'bg-green-600 hover:bg-green-700',
  },
}

/**
 * ConfirmDialog component for user confirmation before destructive or important actions
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 *
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   onConfirm={() => deleteItem(id)}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item? This action cannot be undone."
 *   variant="danger"
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  children,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 bg-opacity-10 ${config.iconColor}`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children && <div className="py-4">{children}</div>}

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={config.buttonClass}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Hook for managing confirm dialog state
 *
 * @example
 * ```tsx
 * const { confirmDialog, confirm } = useConfirmDialog()
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     description: 'Are you sure?',
 *   })
 *
 *   if (confirmed) {
 *     // Perform delete
 *   }
 * }
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     {confirmDialog}
 *   </>
 * )
 * ```
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean
    config: Omit<ConfirmDialogProps, 'open' | 'onOpenChange' | 'onConfirm'>
    resolve?: (value: boolean) => void
  }>({
    open: false,
    config: {
      title: '',
      description: '',
    },
  })

  const confirm = (
    config: Omit<ConfirmDialogProps, 'open' | 'onOpenChange' | 'onConfirm'>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        config,
        resolve,
      })
    })
  }

  const handleConfirm = () => {
    dialogState.resolve?.(true)
    setDialogState((prev) => ({ ...prev, open: false }))
  }

  const handleCancel = () => {
    dialogState.resolve?.(false)
    setDialogState((prev) => ({ ...prev, open: false }))
  }

  const confirmDialog = (
    <ConfirmDialog
      open={dialogState.open}
      onOpenChange={(open) => {
        if (!open) handleCancel()
      }}
      onConfirm={handleConfirm}
      {...dialogState.config}
    />
  )

  return { confirmDialog, confirm }
}