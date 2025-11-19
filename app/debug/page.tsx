// app/debug/page.tsx (temporary - remove after testing)
'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [result, setResult] = useState('')

  const testSupabase = async () => {
    try {
      const response = await fetch('/api/client-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com', // use actual test user
          password: 'testpassword'
        })
      })
      
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Debug Supabase</h1>
      <button 
        onClick={testSupabase}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Authentication
      </button>
      <pre className="mt-4 bg-gray-100 p-4">{result}</pre>
    </div>
  )
}