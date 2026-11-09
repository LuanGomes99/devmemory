import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/** Pilha de modais abertos: só o do topo responde a Esc e Tab. */
const stack: string[] = []
let scrollLocks = 0

interface ModalProps {
  open: boolean
  onClose: () => void
  labelledBy: string
  describedBy?: string
  children: ReactNode
  /** Se falso, Esc e clique fora não fecham (ex.: tela de resultado). */
  dismissible?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
  className?: string
}

export function Modal(props: ModalProps) {
  return createPortal(
    <AnimatePresence>{props.open && <ModalPanel {...props} />}</AnimatePresence>,
    document.body,
  )
}

function ModalPanel({
  onClose,
  labelledBy,
  describedBy,
  children,
  dismissible = true,
  initialFocusRef,
  className = '',
}: ModalProps) {
  const id = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    stack.push(id)
    scrollLocks++
    document.body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => {
      const target =
        initialFocusRef?.current ??
        panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ??
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
        panelRef.current
      target?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panelRef.current.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      const index = stack.lastIndexOf(id)
      if (index !== -1) stack.splice(index, 1)
      scrollLocks = Math.max(0, scrollLocks - 1)
      if (scrollLocks === 0) document.body.style.overflow = ''
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [id, dismissible, initialFocusRef])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => dismissible && onCloseRef.current()}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl border border-line-strong/70 bg-panel shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] outline-none sm:rounded-3xl ${className}`}
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
