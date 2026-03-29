import { connectDB } from '@/lib/mongodb'
import { Visitor } from '@/models/Visitor'
import { CheckCircle, XCircle, User, Briefcase, Calendar, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function VerifyPage({ params }: { params: { passId: string } }) {
  await connectDB()
  const visitor = await Visitor.findOne({ passId: params.passId })

  if (!visitor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invalid Pass</h1>
          <p className="text-gray-500 mb-8">This QR code does not match any registered pass.</p>
        </div>
      </div>
    )
  }

  const passColorMap: Record<string, string> = {
    VIP: 'bg-amber-100 text-amber-800 border-amber-200',
    Speaker: 'bg-blue-100 text-blue-800 border-blue-200',
    Visitor: 'bg-gray-100 text-gray-800 border-gray-200',
    Press: 'bg-purple-100 text-purple-800 border-purple-200',
    Exhibitor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }

  const badgeClass = passColorMap[visitor.passType] || passColorMap['Visitor']

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        <div className="relative pt-8 px-6 pb-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-4 z-10">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 text-center">{visitor.name}</h1>
          
          {visitor.company && (
            <div className="flex items-center text-gray-600 mt-2">
              <Briefcase className="w-4 h-4 mr-2" />
              <span>{visitor.company}</span>
            </div>
          )}
          
          <div className={`mt-4 px-4 py-1.5 rounded-full font-bold text-sm border ${badgeClass} uppercase tracking-wider`}>
            {visitor.passType}
          </div>
          
          <div className="w-full mt-8 bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
            <div className="flex items-start">
              <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Entry Status</p>
                <p className="text-sm font-bold text-green-600 flex items-center">
                  Valid Entry <CheckCircle className="w-4 h-4 ml-1" />
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Event</p>
                <p className="text-sm font-medium text-gray-900">{visitor.eventName}</p>
                <p className="text-xs text-gray-500">{visitor.eventDate}</p>
              </div>
            </div>
            
            {visitor.eventVenue && (
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Venue</p>
                  <p className="text-sm font-medium text-gray-900">{visitor.eventVenue}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-400 font-medium">
            Verified by EventPass System
          </div>
        </div>
      </div>
    </div>
  )
}
