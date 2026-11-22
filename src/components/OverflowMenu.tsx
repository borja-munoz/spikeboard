import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CircleEllipsis, EllipsisVertical } from 'lucide-react'

export interface OverflowMenuItem {
  label: string
  icon: ReactNode
  onSelect: () => void
  destructive?: boolean
}

interface Props {
  items: OverflowMenuItem[]
}

// iOS shows "more" as a circled horizontal ellipsis; Android/Material (and the
// default elsewhere) uses vertical dots. iPadOS reports itself as a Mac with touch.
const IS_APPLE_MOBILE =
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

export function OverflowMenu({ items }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const MoreIcon = IS_APPLE_MOBILE ? CircleEllipsis : EllipsisVertical

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className={`rounded-lg p-2 transition-colors active:bg-[#1a1d2e] active:text-white ${
          open ? 'bg-[#1a1d2e] text-white' : 'text-slate-300 hover:text-white'
        }`}
        aria-label={t('menu.more')}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('menu.more')}
      >
        <MoreIcon size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Invisible backdrop: closes the menu and keeps the tap from reaching the scoreboard */}
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              role="menu"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full z-40 mt-1 w-max min-w-48 max-w-[calc(100vw-1.5rem)] origin-top-right overflow-hidden rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-2xl shadow-black/60"
            >
              {items.map((item, i) => (
                <div key={item.label}>
                  {item.destructive && i > 0 && <div className="my-1 h-px bg-slate-700" />}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setOpen(false)
                      item.onSelect()
                    }}
                    className={`flex w-full items-center gap-3 whitespace-nowrap px-4 py-3 text-left text-sm font-semibold transition-colors active:bg-slate-700 ${
                      item.destructive ? 'text-red-400' : 'text-slate-100'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {item.label}
                  </button>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
