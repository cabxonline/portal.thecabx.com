"use client"

import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ChartAreaInteractive({ data }) {

  return (

    <Card>

      <CardHeader>
        <CardTitle>
          Monthly Bookings
        </CardTitle>
      </CardHeader>

      <CardContent>

        <ResponsiveContainer width="100%" height={300}>

          <AreaChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month"/>

            <Tooltip/>

            <Area
              type="monotone"
              dataKey="bookings"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.2}
            />

          </AreaChart>

        </ResponsiveContainer>

      </CardContent>

    </Card>

  )

}