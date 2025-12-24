'use client'

import { Router } from 'next/router'
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
  onCancel: () => void
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onSubmit, onCancel }) => {
  const router=  useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    roomId: uuidv4() // Pre-generate room ID
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
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
      
      // Reset form on success
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Create New Room
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room Name Field */}
        <div>
          <label 
            htmlFor="name" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Room Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter room name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Room ID Field (Read-only) */}
        <div>
          <label 
            htmlFor="roomId" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Room ID
          </label>
          <input
            type="text"
            id="roomId"
            name="roomId"
            value={formData.roomId}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm text-gray-600"
          />
          <p className="mt-1 text-xs text-gray-500">Auto-generated unique ID</p>
        </div>

        {/* Description Field */}
        <div>
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
            placeholder="Enter room description (optional)"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } text-white focus:outline-none`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Room'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateRoomForm
