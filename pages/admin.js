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
      <div className="p-6" style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', border: '1px solid #064703', boxShadow: '0 5px 15px rgba(5, 41, 2, 0.15)' }}>
          <h1 style={{ color: '#052902', marginBottom: '10px', fontSize: '28px', letterSpacing: '1px' }}>Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #064703', marginBottom: '20px', fontSize: '14px' }}
            onFocus={(e) => { e.target.style.outline = 'none'; e.target.style.borderColor = '#052902'; e.target.style.boxShadow = '0 0 0 2px rgba(5, 41, 2, 0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#064703'; e.target.style.boxShadow = 'none'; }}
          />
          <button
            onClick={() => {
              if (password === ADMIN_PASSWORD) setLoggedIn(true)
              else alert('Wrong password')
            }}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#064703', 
              color: '#f7f7f7', 
              border: '1px solid #064703',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#052902'; e.target.style.borderColor = '#052902'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#064703'; e.target.style.borderColor = '#064703'; }}
          >
            Login
          </button>
        </div>
      </div>
    )

  return (
    <div style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#052902', fontSize: '28px', marginBottom: '30px', letterSpacing: '1px' }}>Edit Menu</h1>
        {menu.map(item => (
          <div 
            key={item.id} 
            style={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #064703', 
              padding: '20px', 
              marginBottom: '20px',
              boxShadow: '0 5px 15px rgba(5, 41, 2, 0.15)'
            }}
          >
            <input
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              placeholder="Item name"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #064703', 
                marginBottom: '10px',
                fontSize: '14px',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => { e.target.style.outline = 'none'; e.target.style.borderColor = '#052902'; e.target.style.boxShadow = '0 0 0 2px rgba(5, 41, 2, 0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#064703'; e.target.style.boxShadow = 'none'; }}
            />
            <input
              value={item.price}
              onChange={(e) => updateItem(item.id, 'price', e.target.value)}
              placeholder="Price"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #064703', 
                marginBottom: '10px',
                fontSize: '14px',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => { e.target.style.outline = 'none'; e.target.style.borderColor = '#052902'; e.target.style.boxShadow = '0 0 0 2px rgba(5, 41, 2, 0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#064703'; e.target.style.boxShadow = 'none'; }}
            />
            <input
              value={item.description}
              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
              placeholder="Description"
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #064703',
                fontSize: '14px',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => { e.target.style.outline = 'none'; e.target.style.borderColor = '#052902'; e.target.style.boxShadow = '0 0 0 2px rgba(5, 41, 2, 0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#064703'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
