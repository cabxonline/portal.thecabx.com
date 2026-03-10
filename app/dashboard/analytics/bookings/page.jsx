"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function Bookings(){

  const [bookings,setBookings] = useState([])
  const [stats,setStats] = useState(null)
  const [loading,setLoading] = useState(true)


  const fetchData = async ()=>{

    try{

      const bookingsRes = await api("/bookings")
      const statsRes = await api("/stats")

      const bookingsData = bookingsRes?.data ?? bookingsRes ?? []

      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setStats(statsRes)

    }catch(err){

      console.error("Booking fetch error:",err)

    }finally{

      setLoading(false)

    }

  }


  useEffect(()=>{
    fetchData()
  },[])



  if(loading){
    return <p className="p-6">Loading bookings...</p>
  }



  return(

    <div className="p-6 space-y-6">

      {/* HEADER */}

      <h1 className="text-2xl font-semibold">
        Booking Analytics
      </h1>



      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <h2 className="text-2xl font-semibold">
            {stats?.bookings ?? bookings.length}
          </h2>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Revenue</p>
          <h2 className="text-2xl font-semibold">
            ₹ {stats?.revenue ?? 0}
          </h2>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Pending</p>
          <h2 className="text-2xl font-semibold">
            {bookings.filter(b=>b.status==="pending").length}
          </h2>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Confirmed</p>
          <h2 className="text-2xl font-semibold">
            {bookings.filter(b=>b.status==="confirmed").length}
          </h2>
        </div>

      </div>



      {/* BOOKINGS TABLE */}

      <div className="border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Pickup</th>
              <th className="p-3 text-left">Drop</th>
              <th className="p-3 text-left">Car</th>
              <th className="p-3 text-left">Fare</th>
              <th className="p-3 text-left">Status</th>
            </tr>

          </thead>

          <tbody>

            {bookings.map(booking =>(

              <tr key={booking.id} className="border-t">

                <td className="p-3">
                  {booking.user?.name || "—"}
                </td>

                <td className="p-3">
                  {booking.pickupAddress}
                </td>

                <td className="p-3">
                  {booking.dropAddress}
                </td>

                <td className="p-3">
                  {booking.carCategory?.name || "—"}
                </td>

                <td className="p-3">
                  ₹ {booking.fare ?? 0}
                </td>

                <td className="p-3">

                  <span className="px-2 py-1 rounded bg-gray-100 text-sm">
                    {booking.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}