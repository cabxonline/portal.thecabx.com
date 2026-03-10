"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function ShowBooking() {

  const { id } = useParams()

  const [booking, setBooking] = useState(null)

  useEffect(() => {

    async function fetchBooking() {

      const data = await api(`/bookings/${id}`)

      setBooking(data)

    }

    fetchBooking()

  }, [id])


  if (!booking) return <p className="p-6">Loading...</p>


  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Booking Details
      </h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-3">

        <p><b>Pickup:</b> {booking.pickupAddress}</p>

        <p><b>Drop:</b> {booking.dropAddress}</p>

        <p><b>User:</b> {booking.user?.name}</p>

        <p><b>Car:</b> {booking.carCategory?.name}</p>

        <p><b>Status:</b> {booking.status}</p>

        <p><b>Fare:</b> ₹ {booking.fare}</p>

      </div>

    </div>

  )

}