"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"

export default function CustomerShow() {

  const { id } = useParams()

  const [customer,setCustomer] = useState(null)
  const [bookings,setBookings] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    async function fetchData(){

      try{

        const userData = await api(`/users/${id}`)
        const bookingsData = await api(`/bookings?userId=${id}`)

        setCustomer(userData)
        setBookings(bookingsData)

      }catch(err){
        console.error(err)
      }finally{
        setLoading(false)
      }

    }

    fetchData()

  },[id])


  if(loading){
    return <p className="p-6">Loading...</p>
  }


  return(

    <div className="p-6 space-y-6">

      {/* CUSTOMER HEADER */}

      <div className="bg-white rounded-lg shadow p-6">

        <h1 className="text-2xl font-semibold mb-4">
          Customer Details
        </h1>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{customer.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{customer.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{customer.phone || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium">{customer.role?.name}</p>
          </div>

        </div>

      </div>


      {/* BOOKING HISTORY */}

      <div className="bg-white rounded-lg shadow">

        <div className="p-6 border-b">

          <h2 className="text-xl font-semibold">
            Booking History
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Pickup</th>
              <th className="p-3 text-left">Drop</th>
              <th className="p-3 text-left">Car</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Fare</th>
              <th className="p-3 text-left">Date</th>

            </tr>

          </thead>

          <tbody>

            {bookings.map(booking => (

              <tr key={booking.id} className="border-t">

                <td className="p-3">{booking.pickupAddress}</td>

                <td className="p-3">{booking.dropAddress}</td>

                <td className="p-3">{booking.carCategory?.name}</td>

                <td className="p-3">

                  <span className="px-2 py-1 rounded text-sm bg-gray-100">
                    {booking.status}
                  </span>

                </td>

                <td className="p-3 font-medium">
                  ₹ {booking.fare || "Pending"}
                </td>

                <td className="p-3 text-sm text-gray-500">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}