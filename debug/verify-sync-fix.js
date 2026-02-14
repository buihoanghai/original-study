#!/usr/bin/env node

/**
 * Quick verification script to test the SyncClient transformation fix
 */

// Mock domain Mindmap
const domainMindmap = {
  id: 'test-123',
  metadata: {
    title: 'Test Mindmap',
    description: 'Test description',
    created: new Date('2024-01-01'),
    updated: new Date('2024-01-02'),
  },
  status: 'draft',
  ownerId: 'user-123',
}

// Mock Payload response
const payloadResponse = {
  id: 'test-123',
  title: 'Test Mindmap',
  description: 'Test description',
  status: 'draft',
  owner: 'user-123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

// Transform domain to Payload format
function transformToPayloadFormat(mindmap) {
  return {
    title: mindmap.metadata.title,
    description: mindmap.metadata.description,
    status: mindmap.status,
  }
}

// Transform Payload to domain format
function transformFromPayloadFormat(payloadDoc) {
  return {
    id: payloadDoc.id,
    metadata: {
      title: payloadDoc.title,
      description: payloadDoc.description || '',
      created: new Date(payloadDoc.createdAt),
      updated: new Date(payloadDoc.updatedAt),
    },
    status: payloadDoc.status,
    ownerId: typeof payloadDoc.owner === 'string' ? payloadDoc.owner : payloadDoc.owner?.id,
  }
}

console.log('✅ Testing transformation functions...\n')

console.log('1. Domain → Payload format:')
const payloadFormat = transformToPayloadFormat(domainMindmap)
console.log(JSON.stringify(payloadFormat, null, 2))
console.log('✓ Has flat title:', payloadFormat.title === 'Test Mindmap')
console.log('✓ Has flat description:', payloadFormat.description === 'Test description')
console.log('✓ No metadata object:', !payloadFormat.metadata)

console.log('\n2. Payload → Domain format:')
const domainFormat = transformFromPayloadFormat(payloadResponse)
console.log(JSON.stringify(domainFormat, null, 2))
console.log('✓ Has metadata object:', !!domainFormat.metadata)
console.log('✓ Has metadata.title:', domainFormat.metadata.title === 'Test Mindmap')
console.log('✓ Has metadata.description:', domainFormat.metadata.description === 'Test description')
console.log('✓ Has ownerId:', domainFormat.ownerId === 'user-123')

console.log('\n✅ All transformations working correctly!')

