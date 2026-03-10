"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function Bookings() {

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {

    async function fetchBookings() {

      try {

        const data = await api("/bookings")

        setBookings(data)

      } catch (error) {

        console.error(error)

      } finally {

        setLoading(false)

      }

    }

    fetchBookings()

  }, [])

  const filteredBookings = bookings.filter((booking) => {

    const matchSearch =
      booking.pickupAddress.toLowerCase().includes(search.toLowerCase()) ||
      booking.dropAddress.toLowerCase().includes(search.toLowerCase())

    const matchStatus =
      statusFilter === "all" || booking.status === statusFilter

    return matchSearch && matchStatus

  })


  if (loading) {
    return <p className="p-6">Loading bookings...</p>
  }

  return (

    <div className="w-full mx-auto p-6">

   <div className="flex justify-between items-center mb-6">

  <h1 className="text-3xl font-bold">
    All Bookings
  </h1>

  <a
    href="/dashboard/bookings/create"
    className="bg-black text-white px-4 py-2 rounded"
  >
    Create Booking
  </a>

</div>


      {/* Filters */}

      <div className="flex flex-wrap gap-4 mb-6">

        <input
          placeholder="Search by location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >

          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>

        </select>

      </div>


      {/* Table */}

      <div className="overflow-x-auto bg-white rounded-xl shadow">

        <table className="w-full text-left">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4">Pickup</th>
              <th className="p-4">Drop</th>
              <th className="p-4">User</th>
              <th className="p-4">Car</th>
              <th className="p-4">Status</th>
              <th className="p-4">Fare</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>

          </thead>

          <tbody>

            {filteredBookings.map((booking) => (

              <tr
                key={booking.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-4">
                  {booking.pickupAddress}
                </td>

                <td className="p-4">
                  {booking.dropAddress}
                </td>

                <td className="p-4">
                  {booking.user?.name}
                </td>

                <td className="p-4">
                  {booking.carCategory?.name}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-sm
                    ${
                      booking.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }
                    `}
                  >

                    {booking.status}

                  </span>

                </td>

                <td className="p-4 font-semibold">
                  ₹ {booking.fare || "Pending"}
                </td>

                <td className="p-4 text-sm text-gray-500">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <a href={`/dashboard/bookings/${booking.id}/edit`} className="text-blue-500 hover:text-blue-700">
                    Edit
                  </a>
                  <a href={`/dashboard/bookings/${booking.id}/delete`} className="text-red-500 hover:text-red-700 ml-4">
                    Delete
                  </a>
                  <a href={`/dashboard/bookings/${booking.id}/show`} className="text-green-500 hover:text-green-700 ml-4">
                    Show
                  </a>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )
}