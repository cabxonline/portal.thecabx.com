"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import PermissionGuard from "@/components/permission-guard"

export default function ManualPricing() {

  const [data, setData] = useState([])
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({
    carId: "",
    from: "",
    to: "",
    date: "",
    price: "",
    tripType: "oneway"
  })


  // ✅ fetch pricing
  const fetchData = async () => {
    try {
      const res = await api("/manual-pricing")
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ fetch car categories
  const fetchCars = async () => {
    try {
      const res = await api("/car-categories")
      setCars(res)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
    fetchCars()
  }, [])


  const openCreate = () => {
    setEditing(null)
    setForm({
      carId: "",
      from: "",
      to: "",
      date: "",
      price: "",
      tripType: "oneway"
    })
    setShowModal(true)
  }


  const openEdit = (item) => {
    setEditing(item)

    setForm({
      carId: item.carId,
      from: item.from,
      to: item.to,
      date: item.date.split("T")[0], // 🔥 important
      price: item.price,
      tripType: item.tripType || "oneway"
    })

    setShowModal(true)
  }


  const handleSubmit = async () => {

    if (!form.carId || !form.from || !form.to || !form.date || !form.price) {
      alert("All fields required")
      return
    }

    try {

      const payload = {
        ...form,
        price: Number(form.price),
        from: form.from.trim().toLowerCase(),
        to: form.to.trim().toLowerCase()
      }

      if (editing) {
        await api(`/manual-pricing/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        })
      } else {
        await api("/manual-pricing", {
          method: "POST",
          body: JSON.stringify(payload)
        })
      }

      setShowModal(false)
      fetchData()

    } catch (err) {
      alert(err.message)
    }

  }


  const handleDelete = async (id) => {
    if (!confirm("Delete pricing?")) return

    try {
      await api(`/manual-pricing/${id}`, {
        method: "DELETE"
      })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }


  if (loading) {
    return <p className="p-6">Loading...</p>
  }


  return (

    <PermissionGuard permission="car.read">

      <div className="p-6 space-y-6">

        <div className="flex justify-between items-center">

          <h1 className="text-2xl font-semibold">
            Manual Pricing
          </h1>

          <button
            onClick={openCreate}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add Pricing
          </button>

        </div>


        <div className="border rounded-lg overflow-hidden">

          <table className="w-full">

            <thead className="bg-muted">

              <tr>
                <th className="p-3 text-left">Car</th>
                <th className="p-3 text-left">Route</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Actions</th>
              </tr>

            </thead>

            <tbody>

              {data.map((item) => (
                <tr key={item.id} className="border-t">

                  <td className="p-3">{item.car?.name}</td>

                  <td className="p-3">
                    {item.from} → {item.to}
                  </td>

                  <td className="p-3">
                    {item.date.split("T")[0]}
                  </td>

                  <td className="p-3">₹{item.price}</td>

                  <td className="p-3 flex gap-3">

                    <button
                      onClick={() => openEdit(item)}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>


        {showModal && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

            <div className="bg-white p-6 rounded-lg w-[400px] space-y-4">

              <h2 className="text-lg font-semibold">
                {editing ? "Edit Pricing" : "Create Pricing"}
              </h2>

              {/* Car */}
              <select
                className="border p-2 w-full"
                value={form.carId}
                onChange={(e) => setForm({ ...form, carId: e.target.value })}
              >
                <option value="">Select Car</option>
                {cars.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="From"
                className="border p-2 w-full"
                value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
              />

              <input
                placeholder="To"
                className="border p-2 w-full"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
              />

              <input
                type="date"
                className="border p-2 w-full"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />

              <input
                type="number"
                placeholder="Price"
                className="border p-2 w-full"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />

              <select
                className="border p-2 w-full"
                value={form.tripType}
                onChange={(e) => setForm({ ...form, tripType: e.target.value })}
              >
                <option value="oneway">One Way</option>
                <option value="round">Round Trip</option>
              </select>

              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setShowModal(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  {editing ? "Update" : "Create"}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </PermissionGuard>

  )

}