'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'

interface FormData {
  name: string
  description: string
  roomId: string
}

interface FormErrors {
  name?: string
  submit?: string
}

interface CreateRoomFormProps {
  onSubmit: (formData: FormData) => Promise<void>
  onCancel?: () => void
  onClose?: () => void
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onSubmit, onCancel, onClose }) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    roomId: uuidv4()
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required'
    }
    return newErrors
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({
        name: '',
        description: '',
        roomId: uuidv4()
      })
      router.push(`/room/${formData.roomId}`)
      setErrors({})
    } catch (error) {
      console.error('Error creating room:', error)
      setErrors({ submit: 'Failed to create room. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onClose) onClose()
    if (onCancel) onCancel()
  }

  return (
    <div className="p-6 bg-white rounded-lg"> {/* Added bg-white to container */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Room</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Room Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            /* Updated class: text-gray-900, bg-white, placeholder:text-gray-500 */
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500"
            placeholder="Enter room name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Room ID Field (Read-only) */}
        <div>
          <label htmlFor="roomId" className="block text-sm font-semibold text-gray-900 mb-2">
            Room ID
          </label>
          <input
            type="text"
            id="roomId"
            name="roomId"
            value={formData.roomId}
            readOnly
            /* Updated class: text-gray-700 for better visibility even when read-only */
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-mono"
          />
          <p className="mt-1 text-xs text-gray-500 font-medium">Auto-generated unique ID</p>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            /* Updated class: text-gray-900, bg-white */
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder:text-gray-500"
            placeholder="Optional: Add a description for your room"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateRoomForm