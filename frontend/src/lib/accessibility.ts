// Keyboard navigation utilities
export const keyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const

// ARIA roles and properties
export const ariaRoles = {
  BUTTON: 'button',
  LINK: 'link',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  SEARCH: 'search',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  OPTION: 'option',
  LISTBOX: 'listbox',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
} as const

// Focus management utilities
export class FocusManager {
  private static elementStack: HTMLElement[] = []

  // Trap focus within a container
  static trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === keyboardKeys.TAB) {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    
    // Store cleanup function
    const cleanup = () => {
      container.removeEventListener('keydown', handleKeyDown)
    }

    return cleanup
  }

  // Save current focus
  static saveFocus() {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement) {
      this.elementStack.push(activeElement)
    }
  }

  // Restore focus to previous element
  static restoreFocus() {
    const previousElement = this.elementStack.pop()
    if (previousElement) {
      previousElement.focus()
    }
  }

  // Focus first element in container
  static focusFirst(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }
}

// Screen reader announcements
export class ScreenReader {
  private static announcementElement: HTMLElement | null = null

  // Initialize announcement element
  private static getAnnouncementElement() {
    if (!this.announcementElement) {
      this.announcementElement = document.createElement('div')
      this.announcementElement.setAttribute('aria-live', 'polite')
      this.announcementElement.setAttribute('aria-atomic', 'true')
      this.announcementElement.className = 'sr-only'
      document.body.appendChild(this.announcementElement)
    }
    return this.announcementElement
  }

  // Announce message to screen readers
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const element = this.getAnnouncementElement()
    element.setAttribute('aria-live', priority)
    element.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      element.textContent = ''
    }, 1000)
  }

  // Announce error message
  static announceError(message: string) {
    this.announce(`Error: ${message}`, 'assertive')
  }

  // Announce success message
  static announceSuccess(message: string) {
    this.announce(`Success: ${message}`, 'polite')
  }

  // Announce status change
  static announceStatus(message: string) {
    this.announce(message, 'polite')
  }
}

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Handle keyboard navigation for custom components
  handleArrowKeyNavigation(
    e: KeyboardEvent,
    currentIndex: number,
    maxIndex: number,
    onSelect: (index: number) => void,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) {
    const isVertical = orientation === 'vertical'
    const incrementKey = isVertical ? keyboardKeys.ARROW_DOWN : keyboardKeys.ARROW_RIGHT
    const decrementKey = isVertical ? keyboardKeys.ARROW_UP : keyboardKeys.ARROW_LEFT

    switch (e.key) {
      case incrementKey:
        e.preventDefault()
        const nextIndex = currentIndex < maxIndex ? currentIndex + 1 : 0
        onSelect(nextIndex)
        break
      case decrementKey:
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex
        onSelect(prevIndex)
        break
      case keyboardKeys.HOME:
        e.preventDefault()
        onSelect(0)
        break
      case keyboardKeys.END:
        e.preventDefault()
        onSelect(maxIndex)
        break
    }
  },

  // Handle menu keyboard navigation
  handleMenuNavigation(
    e: KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onSelect: (index: number) => void,
    onClose: () => void
  ) {
    switch (e.key) {
      case keyboardKeys.ARROW_DOWN:
        e.preventDefault()
        if (currentIndex < itemCount - 1) {
          onSelect(currentIndex + 1)
        }
        break
      case keyboardKeys.ARROW_UP:
        e.preventDefault()
        if (currentIndex > 0) {
          onSelect(currentIndex - 1)
        }
        break
      case keyboardKeys.HOME:
        e.preventDefault()
        onSelect(0)
        break
      case keyboardKeys.END:
        e.preventDefault()
        onSelect(itemCount - 1)
        break
      case keyboardKeys.ESCAPE:
        e.preventDefault()
        onClose()
        break
    }
  }
}

// Accessibility testing utilities
export const accessibilityTesting = {
  // Check if element has proper ARIA attributes
  checkAriaAttributes(element: HTMLElement, requiredAttributes: string[]) {
    const missing = requiredAttributes.filter(attr => !element.hasAttribute(attr))
    return {
      isValid: missing.length === 0,
      missing,
      present: requiredAttributes.filter(attr => element.hasAttribute(attr))
    }
  },

  // Check if element is keyboard accessible
  checkKeyboardAccessibility(element: HTMLElement) {
    const isFocusable = element.tabIndex >= 0
    const isInteractive = element.matches('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    
    return {
      isFocusable,
      isInteractive,
      isAccessible: isFocusable || isInteractive
    }
  },

  // Check color contrast (simplified version)
  checkColorContrast(foreground: string, background: string) {
    // This is a simplified version - in production, you'd want a more robust contrast calculation
    const getLuminance = (color: string) => {
      // Remove # if present
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255
      
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b
      return luminance
    }

    const fgLuminance = getLuminance(foreground)
    const bgLuminance = getLuminance(background)
    
    const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)
    
    return {
      ratio: contrast,
      passesWCAG_AA: contrast >= 4.5,
      passesWCAG_AAA: contrast >= 7,
      passesWCAG_AA_Large: contrast >= 3,
      passesWCAG_AAA_Large: contrast >= 4.5
    }
  }
}

// Utility functions for common accessibility patterns
export const a11y = {
  // Generate unique IDs for accessibility
  generateId(prefix: string = 'a11y') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Create proper button attributes
  getButtonAttributes(disabled: boolean = false, pressed: boolean = false, expanded: boolean = false) {
    const attributes: Record<string, string | boolean> = {
      type: 'button',
      role: ariaRoles.BUTTON,
      disabled,
    }

    if (pressed) attributes['aria-pressed'] = pressed
    if (expanded) attributes['aria-expanded'] = expanded

    return attributes
  },

  // Create proper link attributes
  getLinkAttributes(href: string, external: boolean = false) {
    return {
      role: ariaRoles.LINK,
      href,
      ...(external && { target: '_blank', rel: 'noopener noreferrer' })
    }
  },

  // Create proper label attributes
  getLabelAttributes(forId: string, required: boolean = false) {
    return {
      htmlFor: forId,
      ...(required && { 'aria-required': true })
    }
  },

  // Create proper input attributes
  getInputAttributes(id: string, required: boolean = false, invalid: boolean = false) {
    return {
      id,
      'aria-labelledby': `${id}-label`,
      'aria-describedby': `${id}-description ${id}-error`,
      ...(required && { 'aria-required': true }),
      ...(invalid && { 'aria-invalid': true })
    }
  }
}
