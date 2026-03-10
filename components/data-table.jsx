"use client"

export default function DataTable({ columns, data }) {

  return (

    <div className="border rounded-lg overflow-hidden">

      <table className="w-full">

        <thead className="bg-muted">

          <tr>

            {columns.map(col=>(
              <th key={col.key} className="p-3 text-left">
                {col.label}
              </th>
            ))}

          </tr>

        </thead>

        <tbody>

          {data.map(row=>(
            <tr key={row.id} className="border-t">

              {columns.map(col=>(
                <td key={col.key} className="p-3">

                  {col.render
                    ? col.render(row)
                    : row[col.key]
                  }

                </td>
              ))}

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )

}