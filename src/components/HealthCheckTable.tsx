import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { HealthCheck } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

interface HealthCheckTableProps {
  onEdit?: (item: HealthCheck) => void
}

export function HealthCheckTable({ onEdit }: HealthCheckTableProps) {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Fetch data
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: api.health.list
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.health.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] })
      toast.success('Health deleted successfully')
      setDeletingId(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to delete health: ${error.message}`)
      setDeletingId(null)
    }
  })

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this health?')) {
      setDeletingId(id)
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-800">
        Error loading health: {error.message}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-gray-500">No health found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.status || '-'}
              </TableCell>
              <TableCell>
                {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '-'}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}