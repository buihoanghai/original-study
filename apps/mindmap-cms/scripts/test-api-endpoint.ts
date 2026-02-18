import 'dotenv/config'

async function testApiEndpoint() {
  const mindmapId = '69952aab26e32fc66bbe4988'
  const url = `http://localhost:3001/api/mindmap-nodes?where[mindmap][equals]=${mindmapId}`

  console.log('🔍 Testing API endpoint...\n')
  console.log(`URL: ${url}\n`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`)
      const text = await response.text()
      console.log('Response:', text)
      return
    }

    const data = await response.json()

    console.log(`✅ HTTP 200 OK\n`)
    console.log(`Total docs: ${data.totalDocs}`)
    console.log(`Docs returned: ${data.docs.length}`)
    console.log(`Has next page: ${data.hasNextPage}`)
    console.log(`Limit: ${data.limit}`)
    console.log(`Page: ${data.page}\n`)

    if (data.docs.length < data.totalDocs) {
      console.log(`⚠️  WARNING: Only ${data.docs.length} of ${data.totalDocs} nodes returned!`)
      console.log(`   The API is paginating results. Default limit is probably 10.\n`)
      console.log(`   Frontend needs to request all nodes with limit=100 or fetch all pages.\n`)
    }

    console.log('First 10 nodes:')
    data.docs.slice(0, 10).forEach((node: any) => {
      console.log(`  - ${node.nodeId} | ${node.content?.title || 'No title'}`)
    })

    // Check if foundation-root is in the response
    const foundationRoot = data.docs.find((n: any) => n.nodeId === 'foundation-root')
    if (foundationRoot) {
      console.log('\n✅ foundation-root found in response')
    } else {
      console.log('\n❌ foundation-root NOT in response')
      console.log('   This confirms the API is paginating and not returning all nodes.')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testApiEndpoint()

