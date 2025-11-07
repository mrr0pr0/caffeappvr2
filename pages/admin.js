import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function Admin() {
  const [menu, setMenu] = useState([])
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASS

  useEffect(() => {
    if (loggedIn) loadMenu()
  }, [loggedIn])

  async function loadMenu() {
    const { data } = await supabase.from('menu').select('*')
    setMenu(data)
  }

  async function updateItem(id, field, value) {
    await supabase.from('menu').update({ [field]: value }).eq('id', id)
    loadMenu()
  }

  if (!loggedIn)
    return (
      <div className="p-6">
        <h1>Admin Login</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={() => {
            if (password === ADMIN_PASSWORD) setLoggedIn(true)
            else alert('Wrong password')
          }}
          className="ml-2 p-2 bg-blue-500 text-white"
        >
          Login
        </button>
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Edit Menu</h1>
      {menu.map(item => (
        <div key={item.id} className="border p-2 mb-2">
          <input
            value={item.name}
            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
            className="border p-1 mr-2"
          />
          <input
            value={item.price}
            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
            className="border p-1 mr-2"
          />
          <input
            value={item.description}
            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
            className="border p-1"
          />
        </div>
      ))}
    </div>
  )
}
