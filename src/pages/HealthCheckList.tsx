import { useState } from 'react'
import { HealthCheckTable } from '@/components/HealthCheckTable'
import { HealthCheckForm } from '@/components/HealthCheckForm'
import { HealthCheck } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

export function HealthCheckList() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<HealthCheck | undefined>()

  const handleEdit = (item: HealthCheck) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingItem(undefined)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Health</h1>
            <p className="text-gray-500 mt-1">
              Manage your health
            </p>
          </div>
        </div>
      </div>

      <HealthCheckTable onEdit={handleEdit} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Create'} Health
            </DialogTitle>
          </DialogHeader>
          <HealthCheckForm
            initialData={editingItem}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}