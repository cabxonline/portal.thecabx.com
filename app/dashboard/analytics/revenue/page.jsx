"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function RevenueReports(){

  const [payments,setPayments] = useState([])
  const [stats,setStats] = useState(null)
  const [loading,setLoading] = useState(true)


  const fetchData = async ()=>{

    try{

      const paymentsRes = await api("/payments")
      const statsRes = await api("/stats")

      const paymentsData = paymentsRes?.data ?? paymentsRes ?? []

      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      setStats(statsRes)

    }catch(err){

      console.error("Revenue fetch error:",err)

    }finally{

      setLoading(false)

    }

  }


  useEffect(()=>{
    fetchData()
  },[])



  const totalRevenue = payments
    .filter(p => p.status === "paid")
    .reduce((sum,p)=>sum + (p.amount || 0),0)


  const pendingRevenue = payments
    .filter(p => p.status === "pending")
    .reduce((sum,p)=>sum + (p.amount || 0),0)



  if(loading){
    return <p className="p-6">Loading revenue...</p>
  }



  return(

    <div className="p-6 space-y-6">

      {/* HEADER */}

      <h1 className="text-2xl font-semibold">
        Revenue Reports
      </h1>



      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <h2 className="text-2xl font-semibold">
            ₹ {totalRevenue}
          </h2>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Pending Payments</p>
          <h2 className="text-2xl font-semibold">
            ₹ {pendingRevenue}
          </h2>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Transactions</p>
          <h2 className="text-2xl font-semibold">
            {payments.length}
          </h2>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-gray-500 text-sm">Completed Payments</p>
          <h2 className="text-2xl font-semibold">
            {payments.filter(p=>p.status==="paid").length}
          </h2>
        </div>

      </div>



      {/* PAYMENTS TABLE */}

      <div className="border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">Booking</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Provider</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>

          </thead>

          <tbody>

            {payments.map(payment => (

              <tr key={payment.id} className="border-t">

                <td className="p-3">
                  {payment.booking?.id?.slice(0,8) || "—"}
                </td>

                <td className="p-3">
                  {payment.booking?.user?.name || "—"}
                </td>

                <td className="p-3">
                  ₹ {payment.amount}
                </td>

                <td className="p-3">
                  {payment.provider}
                </td>

                <td className="p-3">

                  <span className="px-2 py-1 rounded bg-gray-100 text-sm">
                    {payment.status}
                  </span>

                </td>

                <td className="p-3">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}