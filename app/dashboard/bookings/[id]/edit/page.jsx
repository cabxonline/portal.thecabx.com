"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function EditBooking() {

  const { id } = useParams()
  const router = useRouter()

  const [booking, setBooking] = useState(null)

  useEffect(() => {

    async function fetchBooking() {

      const data = await api(`/bookings/${id}`)

      setBooking(data)

    }

    fetchBooking()

  }, [id])


  const handleChange = (e) => {

    setBooking({
      ...booking,
      [e.target.name]: e.target.value
    })

  }


  const handleSubmit = async (e) => {

    e.preventDefault()

    await api(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(booking)
    })

    router.push("/dashboard/bookings")

  }


  if (!booking) return <p>Loading...</p>


  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Edit Booking
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >

        <input
          name="pickupAddress"
          value={booking.pickupAddress}
          onChange={handleChange}
          className="border p-3 w-full rounded"
        />

        <input
          name="dropAddress"
          value={booking.dropAddress}
          onChange={handleChange}
          className="border p-3 w-full rounded"
        />

        <select
          name="status"
          value={booking.status}
          onChange={handleChange}
          className="border p-3 w-full rounded"
        >

          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>

        </select>

        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          Update Booking
        </button>

      </form>

    </div>

  )

}