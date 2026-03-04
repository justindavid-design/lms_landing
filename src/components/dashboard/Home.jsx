import React from 'react'
import HeaderStats from './HeaderStats'
import CourseCard from './CourseCard'
import StatsChart from './StatsChart'
import { useAuth } from '../../lib/AuthProvider'

const sampleCourses = [
  { image: '/src/assets/course.png', title: 'Learn Figma', author: 'Christopher Morgan', length: '6h 30min' },
  { image: '/src/assets/task.png', title: 'Analog photography', author: 'Gordon Norman', length: '3h 15min' },
  { image: '/src/assets/course.png', title: 'Master Instagram', author: 'Sophie Gill', length: '7h 40min' },
]

export default function Home(){
  const { user } = useAuth()
  const display_name = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Josh'
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left column */}
      <div className="col-span-8">
        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm relative overflow-visible">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Hello, {display_name}!</h3>
              <p className="text-slate-500">It's good to see you again.</p>
            </div>
            <div aria-hidden className="w-24" />
          </div>
          <img src="/src/assets/b.png" alt="avatar" className="absolute right-4 -top-6 w-32 h-32 object-contain" />
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Spanish B2</div>
              <div className="font-semibold">by Alejandro Velazquez</div>
            </div>
            <button className="px-4 py-2 bg-black text-white rounded-md">Continue</button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold">Courses</h4>
          <div className="text-sm text-slate-500">All Courses</div>
        </div>

        <div className="space-y-4">
          {sampleCourses.map((c, i) => (
            <CourseCard key={i} course={c} />
          ))}
        </div>
      </div>

      {/* Right column */}
      <div className="col-span-4 space-y-4">
        <HeaderStats stats={[{label:'Courses completed', value:11},{label:'Courses in progress', value:4}]} />
        <StatsChart />
      </div>
    </div>
  )
}
