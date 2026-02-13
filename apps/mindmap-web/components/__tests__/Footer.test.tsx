import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '../Footer'

describe('Footer Component', () => {
  it('should render footer with copyright information', () => {
    render(<Footer />)

    const currentYear = new Date().getFullYear()
    expect(
      screen.getByText(`© ${currentYear} Mindmap Learning. All rights reserved.`)
    ).toBeInTheDocument()
  })

  it('should render product links', () => {
    render(<Footer />)

    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('My Mindmaps')).toBeInTheDocument()
    expect(screen.getByText('Create Mindmap')).toBeInTheDocument()
    expect(screen.getByText('Review Flashcards')).toBeInTheDocument()
  })

  it('should render resources links', () => {
    render(<Footer />)

    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.getByText('Help Center')).toBeInTheDocument()
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('should render company links', () => {
    render(<Footer />)

    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
  })

  it('should render connect links', () => {
    render(<Footer />)

    expect(screen.getByText('Connect')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Twitter')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('should have correct navigation links', () => {
    render(<Footer />)

    const myMindmapsLink = screen.getByText('My Mindmaps').closest('a')
    const createMindmapLink = screen.getByText('Create Mindmap').closest('a')
    const reviewLink = screen.getByText('Review Flashcards').closest('a')

    expect(myMindmapsLink).toHaveAttribute('href', '/')
    expect(createMindmapLink).toHaveAttribute('href', '/new')
    expect(reviewLink).toHaveAttribute('href', '/review')
  })

  it('should apply correct CSS classes for styling', () => {
    const { container } = render(<Footer />)

    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('border-t', 'border-zinc-200', 'bg-white')
  })

  it('should use grid layout for footer sections', () => {
    const { container } = render(<Footer />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
  })
})

