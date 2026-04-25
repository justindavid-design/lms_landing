import React from 'react'
import { ChevronRight } from '@mui/icons-material'
import { Link } from 'react-router-dom'

export default function PageHeader({ logo, items = [], title, subtitle }) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        {logo && (
          <>
            <span className="font-bold text-main">{logo}</span>
            <ChevronRight sx={{ fontSize: '1rem' }} className="text-muted" />
          </>
        )}
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {item.href ? (
              <Link to={item.href} className="text-indigo-600 hover:text-indigo-700 font-medium">
                {item.label}
              </Link>
            ) : (
              <span className="text-muted">{item.label}</span>
            )}
            {idx < items.length - 1 && <ChevronRight sx={{ fontSize: '1rem' }} className="text-muted" />}
          </div>
        ))}
      </div>

      {/* Title and Subtitle */}
      <div>
        {title && <h1 className="text-3xl md:text-4xl font-black tracking-tight text-main">{title}</h1>}
        {subtitle && <p className="mt-2 text-base text-muted">{subtitle}</p>}
      </div>
    </div>
  )
}
