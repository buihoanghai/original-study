import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // Allow public registration
    create: () => true,
    // Users can read their own profile
    read: ({ req: { user }, id }) => {
      if (!user) return false
      if (id) return user.id === id
      return true
    },
    // Users can update their own profile
    update: ({ req: { user }, id }) => {
      if (!user) return false
      return user.id === id
    },
    // Users cannot delete themselves (admin only)
    delete: () => false,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
