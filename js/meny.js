import { supabase } from '../lib/supabaseClient.js'

const menuRoot = document.getElementById('menu-root')
const emptyState = document.getElementById('menu-empty')
const errorBox = document.getElementById('menu-error')

function showError(message) {
    if (!errorBox) return
    errorBox.textContent = message
    errorBox.style.display = 'block'
}

function clearError() {
    if (!errorBox) return
    errorBox.textContent = ''
    errorBox.style.display = 'none'
}

function groupByCategory(items) {
    const map = new Map()
    for (const item of items) {
        const category = item.category || 'Annet'
        if (!map.has(category)) map.set(category, [])
        map.get(category).push(item)
    }
    return map
}

function createItemCard(item) {
    const card = document.createElement('div')
    card.className = 'menu-card'

    const img = document.createElement('img')
    img.className = 'menu-card-image'
    img.alt = item.name || 'Menybilde'
    if (item.image_url) {
        img.src = item.image_url
    } else if (item.image_path) {
        const { data } = supabase.storage.from('menu-images').getPublicUrl(item.image_path)
        if (data && data.publicUrl) img.src = data.publicUrl
    }

    const body = document.createElement('div')
    body.className = 'menu-card-body'

    const title = document.createElement('h4')
    title.textContent = item.name || ''

    const desc = document.createElement('p')
    desc.className = 'menu-card-desc'
    desc.textContent = item.description || ''

    const price = document.createElement('div')
    price.className = 'price'
    if (typeof item.price === 'number') {
        price.textContent = `${item.price.toFixed(0)} kr`
    } else if (typeof item.price === 'string') {
        price.textContent = item.price
    } else {
        price.textContent = ''
    }

    body.appendChild(title)
    if (desc.textContent) body.appendChild(desc)
    body.appendChild(price)

    if (img.src) card.appendChild(img)
    card.appendChild(body)

    return card
}

function renderMenu(items) {
    if (!menuRoot) return
    menuRoot.innerHTML = ''

    if (!items.length) {
        if (emptyState) emptyState.style.display = 'block'
        return
    }

    if (emptyState) emptyState.style.display = 'none'

    const byCategory = groupByCategory(items)
    for (const [category, list] of byCategory) {
        const section = document.createElement('div')
        section.className = 'menu-category'

        const h3 = document.createElement('h3')
        h3.textContent = category

        const itemsWrap = document.createElement('div')
        itemsWrap.className = 'menu-items-grid'

        // optional: order by position then name
        list.sort((a, b) => {
            const pa = typeof a.position === 'number' ? a.position : 9999
            const pb = typeof b.position === 'number' ? b.position : 9999
            if (pa !== pb) return pa - pb
            return (a.name || '').localeCompare(b.name || '')
        })

        for (const item of list) {
            itemsWrap.appendChild(createItemCard(item))
        }

        section.appendChild(h3)
        section.appendChild(itemsWrap)
        menuRoot.appendChild(section)
    }
}

async function loadMenu() {
    clearError()
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('id, name, description, price, category, image_url, image_path, position')
            .order('category', { ascending: true })
            .order('position', { ascending: true })
            .order('name', { ascending: true })

        if (error) throw error
        renderMenu(Array.isArray(data) ? data : [])
    } catch (err) {
        console.error('Kunne ikke laste meny:', err)
        showError('Kunne ikke laste menyen akkurat nå. Prøv igjen senere.')
        renderMenu([])
    }
}

loadMenu()


